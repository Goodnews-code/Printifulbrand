import {
  renderReceiptFromPaidOrder,
} from "@/lib/email/receipt-template";
import type { PaidOrderInput } from "@/lib/orders";

/** Send the branded order receipt to the customer via Resend. */
export async function sendOrderReceipt(
  order: PaidOrderInput,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM || "Printiful <orders@shopprintiful.com>";
  const replyTo =
    process.env.RESEND_REPLY_TO || "shopprintiful@gmail.com";

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping receipt");
    return false;
  }

  const to = order.customer.email?.trim();
  if (!to) {
    console.warn("[email] no customer email — skipping receipt");
    return false;
  }

  const { subject, html, text } = renderReceiptFromPaidOrder(order);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[email] Resend failed:", res.status, body);
    return false;
  }

  return true;
}
