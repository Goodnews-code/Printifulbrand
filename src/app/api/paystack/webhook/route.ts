import { NextRequest } from "next/server";
import {
  confirmPaystackPayment,
  getPaystackSecretKey,
  isValidPaystackSignature,
} from "@/lib/paystack";
import { processPaidOrder } from "@/lib/orders";

export const runtime = "nodejs";

function metaField(
  meta: Record<string, unknown> | null | undefined,
  variable: string,
): string {
  if (!meta) return "";
  const fields = meta.custom_fields;
  if (!Array.isArray(fields)) return "";
  for (const field of fields) {
    if (
      field &&
      typeof field === "object" &&
      "variable_name" in field &&
      (field as { variable_name?: string }).variable_name === variable &&
      "value" in field
    ) {
      return String((field as { value?: unknown }).value ?? "");
    }
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = await getPaystackSecretKey();

    if (!isValidPaystackSignature(rawBody, signature, secret)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as {
      event?: string;
      data?: {
        reference?: string;
        status?: string;
        amount?: number;
        currency?: string;
        metadata?: Record<string, unknown> | null;
        customer?: { email?: string };
      };
    };

    if (event.event !== "charge.success" || !event.data?.reference) {
      return Response.json({ received: true, ignored: true });
    }

    // Re-confirm with Paystack verify API — do not trust webhook body alone.
    const data = await confirmPaystackPayment(event.data.reference, {
      expectedAmountKobo: event.data.amount,
      expectedCurrency: event.data.currency || "NGN",
      attempts: 3,
      delayMs: 1500,
    });

    const meta = (data.metadata ?? null) as Record<string, unknown> | null;
    const email = data.customer?.email || event.data.customer?.email || "";
    const name = metaField(meta, "name") || email || "Customer";
    const phone = metaField(meta, "phone") || undefined;
    let shipping:
      | {
          line1: string;
          line2?: string;
          city: string;
          state: string;
          postalCode?: string;
          country: string;
        }
      | undefined;
    if (
      meta &&
      meta.shipping_address &&
      typeof meta.shipping_address === "object"
    ) {
      shipping = meta.shipping_address as typeof shipping;
    }
    const amountNaira = data.amount / 100;

    if (!email) {
      return Response.json(
        { error: "Missing email or reference" },
        { status: 400 },
      );
    }

    let items:
      | Array<{
          name: string;
          qty: number;
          price: number;
          size?: string;
          color?: string;
        }>
      | undefined;
    if (meta && Array.isArray(meta.cart_items)) {
      items = meta.cart_items as typeof items;
    }

    const result = await processPaidOrder({
      reference: data.reference,
      amountNaira,
      currency: data.currency || "NGN",
      customer: { name, email, phone, shipping },
      items,
      paystackPayload: data,
    });

    return Response.json({ received: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook failed";
    console.error("[paystack webhook]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
