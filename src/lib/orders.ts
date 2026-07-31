import { sendOrderReceipt } from "@/lib/email/send-receipt";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/notify/telegram";
import { formatNaira } from "@/lib/utils";

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

  if (order.items && order.items.length > 0) {
    lines.push("", "Items:");
    for (const item of order.items) {
      const meta = [item.size, item.color].filter(Boolean).join(" · ");
      const label = meta ? `${item.name} (${meta})` : item.name;
      lines.push(
        `• ${label} × ${item.qty} — ${formatNaira(item.price * item.qty)}`,
      );
    }
  }

  return lines.join("\n");
}

/**
 * Upsert a successful payment, notify Telegram, and email the customer receipt once.
 * Idempotent on `reference` — skips notify/email if already status=success.
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

  const alreadySuccess = existing?.status === "success";

  const payload = {
    items: input.items ?? [],
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
    if (error) throw new Error(error.message);
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
