import { NextRequest } from "next/server";
import { z } from "zod";
import { confirmPaystackPayment } from "@/lib/paystack";
import {
  processPaidOrder,
  type OrderItemSnapshot,
} from "@/lib/orders";

export const runtime = "nodejs";

const shippingSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().optional(),
  country: z.string().min(1),
  deliveryZone: z.string().optional(),
  deliveryFee: z.number().nonnegative().optional(),
});

const bodySchema = z.object({
  reference: z.string().min(3),
  /** Cart total in kobo — must match what Paystack recorded. */
  expectedAmountKobo: z.number().int().positive().optional(),
  forceNotify: z.boolean().optional(),
  customer: z
    .object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      shipping: shippingSchema.optional(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        name: z.string(),
        qty: z.number().positive(),
        price: z.number().nonnegative(),
        size: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .optional(),
});

function nameFromMetadata(meta: Record<string, unknown> | null | undefined) {
  if (!meta) return "";
  const fields = meta.custom_fields;
  if (Array.isArray(fields)) {
    for (const field of fields) {
      if (
        field &&
        typeof field === "object" &&
        "variable_name" in field &&
        (field as { variable_name?: string }).variable_name === "name" &&
        "value" in field
      ) {
        return String((field as { value?: unknown }).value ?? "");
      }
    }
  }
  if (typeof meta.customer_name === "string") return meta.customer_name;
  return "";
}

function phoneFromMetadata(meta: Record<string, unknown> | null | undefined) {
  if (!meta) return "";
  const fields = meta.custom_fields;
  if (Array.isArray(fields)) {
    for (const field of fields) {
      if (
        field &&
        typeof field === "object" &&
        "variable_name" in field &&
        (field as { variable_name?: string }).variable_name === "phone" &&
        "value" in field
      ) {
        return String((field as { value?: unknown }).value ?? "");
      }
    }
  }
  if (typeof meta.customer_phone === "string") return meta.customer_phone;
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid verify payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { reference, customer, items, forceNotify, expectedAmountKobo } =
      parsed.data;

    // Never trust the browser alone — confirm with Paystack API.
    const data = await confirmPaystackPayment(reference, {
      expectedAmountKobo,
      expectedCurrency: "NGN",
      attempts: 5,
      delayMs: 2000,
    });

    const meta = (data.metadata ?? null) as Record<string, unknown> | null;
    const amountNaira = data.amount / 100;
    const email =
      customer?.email || data.customer?.email || "";
    const name =
      customer?.name || nameFromMetadata(meta) || email || "Customer";
    const phone = customer?.phone || phoneFromMetadata(meta) || undefined;
    const shipping =
      customer?.shipping ||
      (meta &&
      meta.shipping_address &&
      typeof meta.shipping_address === "object"
        ? (meta.shipping_address as {
            line1: string;
            line2?: string;
            city: string;
            state: string;
            postalCode?: string;
            country: string;
          })
        : undefined);

    if (!email) {
      return Response.json(
        { error: "Missing customer email on payment" },
        { status: 400 },
      );
    }

    const result = await processPaidOrder(
      {
        reference: data.reference,
        amountNaira,
        currency: data.currency || "NGN",
        customer: { name, email, phone, shipping },
        items: items as OrderItemSnapshot[] | undefined,
        paystackPayload: data,
      },
      { forceNotify: Boolean(forceNotify) },
    );

    return Response.json({
      ok: true,
      paystackStatus: data.status,
      paidAt: data.paid_at ?? null,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verify failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
