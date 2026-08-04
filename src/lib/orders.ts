import { sendOrderReceipt } from "@/lib/email/send-receipt";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/notify/telegram";
import {
  formatShippingAddress,
  formatBillingAddress,
  type OrderShippingAddress,
  type OrderBillingAddress,
} from "@/lib/shipping";
import { formatNaira } from "@/lib/utils";

export type { OrderShippingAddress, OrderBillingAddress };

export type OrderItemSnapshot = {
  name: string;
  qty: number;
  price: number;
  size?: string;
  color?: string;
};

export type OrderCustomer = {
  name: string;
  email: string;
  phone?: string;
  shipping?: OrderShippingAddress;
  billing?: OrderBillingAddress;
};

export type PaidOrderInput = {
  reference: string;
  amountNaira: number;
  currency: string;
  customer: OrderCustomer;
  items?: OrderItemSnapshot[];
  paystackPayload?: unknown;
};

export type ProcessPaidResult = {
  reference: string;
  alreadyRecorded: boolean;
  notified: boolean;
  receiptSent: boolean;
  notifyError?: string;
};

export type ProcessPaidOptions = {
  /** Re-send Telegram/email even if this order was already marked success. */
  forceNotify?: boolean;
};

function buildTelegramText(order: PaidOrderInput): string {
  const lines = [
    "New Printiful order",
    "",
    `Ref: ${order.reference}`,
    `Amount: ${formatNaira(order.amountNaira)} ${order.currency}`,
    `Customer: ${order.customer.name}`,
    `Email: ${order.customer.email}`,
  ];

  if (order.customer.phone) {
    lines.push(`Phone: ${order.customer.phone}`);
  }

  if (order.customer.shipping) {
    lines.push("", "Shipping address:");
    lines.push(formatShippingAddress(order.customer.shipping));
    if (
      typeof order.customer.shipping.deliveryFee === "number" &&
      order.customer.shipping.deliveryFee > 0
    ) {
      const zone =
        order.customer.shipping.deliveryZone ||
        order.customer.shipping.shippingArea ||
        order.customer.shipping.state ||
        "Shipping";
      lines.push(
        `Shipping fee: ${zone} — ${formatNaira(order.customer.shipping.deliveryFee)}`,
      );
    }
  }

  if (order.customer.billing) {
    lines.push("", "Billing address:");
    if (order.customer.billing.sameAsShipping) {
      lines.push("Same as shipping address");
    } else {
      lines.push(formatBillingAddress(order.customer.billing));
    }
  }

  if (order.items && order.items.length > 0) {
    lines.push("", "Items:");
    for (const item of order.items) {
      const meta = [
        item.size && item.size !== "One Size" ? item.size : null,
        item.color && item.color !== "—" && item.color !== "Default"
          ? item.color
          : null,
      ]
        .filter(Boolean)
        .join(" · ");
      const label = meta ? `${item.name} (${meta})` : item.name;
      lines.push(
        `• ${label} × ${item.qty} — ${formatNaira(item.price * item.qty)}`,
      );
    }
    const itemsSubtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    lines.push(`Items subtotal: ${formatNaira(itemsSubtotal)}`);
  }

  return lines.join("\n");
}

/**
 * Upsert a successful payment, notify Telegram, and email the customer receipt once.
 * Call only after Paystack verify API returns status=success.
 * Idempotent on `reference` — skips notify/email if already status=success.
 * Safe when verify + webhook race: duplicate inserts become updates and skip a second receipt.
 */
export async function processPaidOrder(
  input: PaidOrderInput,
  options: ProcessPaidOptions = {},
): Promise<ProcessPaidResult> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("orders")
    .select("id, status")
    .eq("reference", input.reference)
    .maybeSingle();

  let alreadySuccess = existing?.status === "success";

  const payload = {
    items: input.items ?? [],
    shipping: input.customer.shipping ?? null,
    billing: input.customer.billing ?? null,
    paystack: input.paystackPayload ?? null,
  };

  const row = {
    reference: input.reference,
    customer_name: input.customer.name,
    customer_email: input.customer.email,
    customer_phone: input.customer.phone || null,
    amount: input.amountNaira,
    currency: input.currency || "NGN",
    status: "success",
    payload,
    updated_at: now,
  };

  if (existing) {
    const { error } = await supabase
      .from("orders")
      .update(row)
      .eq("reference", input.reference);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("orders").insert({
      ...row,
      created_at: now,
    });

    if (error) {
      // Verify + webhook often race: the other writer already inserted this reference.
      if (isUniqueReferenceViolation(error)) {
        const { error: updateError } = await supabase
          .from("orders")
          .update(row)
          .eq("reference", input.reference);
        if (updateError) throw new Error(updateError.message);

        const { data: raced } = await supabase
          .from("orders")
          .select("id, status")
          .eq("reference", input.reference)
          .maybeSingle();

        // Peer likely already sent Telegram/receipt — do not send again.
        if (raced?.status === "success") {
          alreadySuccess = true;
        }
      } else {
        throw new Error(error.message);
      }
    }
  }

  let notified = false;
  let receiptSent = false;
  let notifyError: string | undefined;
  if (!alreadySuccess || options.forceNotify) {
    const [telegram, emailOk] = await Promise.all([
      sendTelegramMessage(buildTelegramText(input)),
      sendOrderReceipt(input),
    ]);
    notified = telegram.ok;
    receiptSent = emailOk;
    if (!telegram.ok) {
      notifyError = telegram.error;
    }
  }

  return {
    reference: input.reference,
    alreadyRecorded: alreadySuccess,
    notified,
    receiptSent,
    notifyError,
  };
}

function isUniqueReferenceViolation(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "23505") return true;
  const message = (error.message || "").toLowerCase();
  return (
    message.includes("orders_reference_key") ||
    message.includes("duplicate key") ||
    message.includes("unique constraint")
  );
}
