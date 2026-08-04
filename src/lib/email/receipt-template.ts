import { formatNaira } from "@/lib/utils";
import { formatShippingLines } from "@/lib/shipping";
import type { OrderCustomer, OrderItemSnapshot, PaidOrderInput } from "@/lib/orders";

const BRAND = {
  purple: "#53009B",
  purpleDeep: "#3A006E",
  yellow: "#FFFF00",
  black: "#111111",
  ink: "#1A0033",
  muted: "#7A6895",
  border: "#EDE8FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F5FF",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shopprintiful.com";
/** PNG mark — many email clients block SVG; used as brand avatar in the receipt. */
const LOGO_MARK_URL = `${SITE_URL}/assets/logo-email.png`;
const CONTACT_EMAIL = "shopprintiful@gmail.com";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function itemRows(items: OrderItemSnapshot[]): string {
  if (!items.length) {
    return `
      <tr>
        <td colspan="3" style="padding:14px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.muted};">
          Order details will appear in your Printiful admin records.
        </td>
      </tr>`;
  }

  return items
    .map((item) => {
      const meta = [
        item.size && item.size !== "One Size" ? item.size : null,
        item.color && item.color !== "—" && item.color !== "Default"
          ? item.color
          : null,
      ]
        .filter(Boolean)
        .join(" · ");
      const name = escapeHtml(item.name);
      const metaHtml = meta
        ? `<div style="margin-top:4px;font-size:12px;color:${BRAND.muted};">${escapeHtml(meta)}</div>`
        : "";
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid ${BRAND.border};vertical-align:top;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${BRAND.ink};">${name}</div>
            ${metaHtml}
          </td>
          <td style="padding:14px 8px;border-bottom:1px solid ${BRAND.border};vertical-align:top;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.ink};white-space:nowrap;">
            × ${item.qty}
          </td>
          <td style="padding:14px 0;border-bottom:1px solid ${BRAND.border};vertical-align:top;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${BRAND.ink};white-space:nowrap;">
            ${escapeHtml(formatNaira(item.price * item.qty))}
          </td>
        </tr>`;
    })
    .join("");
}

export type ReceiptEmailData = {
  reference: string;
  amountNaira: number;
  currency?: string;
  customer: OrderCustomer;
  items?: OrderItemSnapshot[];
  paidAt?: string;
};

export function receiptEmailSubject(reference: string) {
  return `Printiful receipt — ${reference}`;
}

export function renderOrderReceiptText(data: ReceiptEmailData): string {
  const lines = [
    "PRINTIFUL — PAYMENT RECEIPT",
    "",
    `Hi ${data.customer.name},`,
    "",
    "Thank you for your order. Your payment was successful.",
    "",
    `Reference: ${data.reference}`,
    "",
  ];

  if (data.items?.length) {
    lines.push("Items:");
    for (const item of data.items) {
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
        `- ${label} × ${item.qty} — ${formatNaira(item.price * item.qty)}`,
      );
    }
    const itemsSubtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    lines.push(`Items subtotal: ${formatNaira(itemsSubtotal)}`);
    lines.push("");
  }

  if (data.customer.shipping) {
    lines.push("Shipping address:");
    lines.push(...formatShippingLines(data.customer.shipping));
    if (
      typeof data.customer.shipping.deliveryFee === "number" &&
      data.customer.shipping.deliveryFee > 0
    ) {
      const zone =
        data.customer.shipping.deliveryZone ||
        data.customer.shipping.shippingArea ||
        data.customer.shipping.state ||
        "Shipping";
      lines.push(
        `Shipping fee: ${zone} — ${formatNaira(data.customer.shipping.deliveryFee)}`,
      );
    }
    lines.push("");
  }

  lines.push(
    `Total paid: ${formatNaira(data.amountNaira)} ${data.currency || "NGN"}`,
    "",
    "Questions? Reply to this email or write shopprintiful@gmail.com",
    "",
    "Be Bold. Be Seen. Be Known.",
    "Printiful Custom Studio",
    SITE_URL,
  );

  return lines.join("\n");
}

/** Brand HTML receipt — table layout + inline CSS for email clients. */
export function renderOrderReceiptHtml(data: ReceiptEmailData): string {
  const dateLabel = data.paidAt
    ? new Date(data.paidAt).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  const items = data.items ?? [];
  const safeName = escapeHtml(data.customer.name);
  const safeRef = escapeHtml(data.reference);
  const safeEmail = escapeHtml(data.customer.email);
  const safePhone = data.customer.phone
    ? escapeHtml(data.customer.phone)
    : "";
  const shippingHtml = data.customer.shipping
    ? formatShippingLines(data.customer.shipping)
        .map((line) => escapeHtml(line))
        .join("<br />")
    : "";
  const deliveryFee =
    typeof data.customer.shipping?.deliveryFee === "number"
      ? data.customer.shipping.deliveryFee
      : 0;
  const deliveryZoneLabel =
    data.customer.shipping?.deliveryZone ||
    data.customer.shipping?.state ||
    "Delivery";
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Printiful Receipt</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.surfaceAlt};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your Printiful payment of ${escapeHtml(formatNaira(data.amountNaira))} was successful — ref ${safeRef}.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.surfaceAlt};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${BRAND.surface};border:1px solid ${BRAND.border};">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND.black};padding:28px 28px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:14px;">
                          <img src="${LOGO_MARK_URL}" alt="Printiful" width="52" height="52" style="display:block;border:0;border-radius:50%;width:52px;height:52px;" />
                        </td>
                        <td style="vertical-align:middle;">
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:900;letter-spacing:0.04em;color:${BRAND.yellow};">
                            PRINTIFUL
                          </div>
                          <div style="margin-top:4px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.55);">
                            Custom Studio
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block;background:${BRAND.yellow};color:${BRAND.black};font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 10px;">
                      Receipt
                    </span>
                  </td>
                </tr>
              </table>
              <div style="margin-top:22px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND.yellow};">
                Payment confirmed
              </div>
              <div style="margin-top:8px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.15;color:#FFFFFF;font-style:italic;">
                Thank you, ${safeName}.
              </div>
              <div style="margin-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.72);">
                Your order is paid and queued for production. Keep this receipt for your records.
              </div>
            </td>
          </tr>

          <!-- Meta strip -->
          <tr>
            <td style="padding:0;background:${BRAND.purple};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#FFFFFF;">
                    <strong style="opacity:0.7;">Ref</strong>&nbsp;&nbsp;${safeRef}
                  </td>
                  <td align="right" style="padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#FFFFFF;">
                    <strong style="opacity:0.7;">Paid</strong>&nbsp;&nbsp;${escapeHtml(dateLabel)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.purple};">
                Order summary
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
                <tr>
                  <td style="padding:0 0 8px;border-bottom:2px solid ${BRAND.ink};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">
                    Item
                  </td>
                  <td style="padding:0 8px 8px;border-bottom:2px solid ${BRAND.ink};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};text-align:center;">
                    Qty
                  </td>
                  <td style="padding:0 0 8px;border-bottom:2px solid ${BRAND.ink};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};text-align:right;">
                    Amount
                  </td>
                </tr>
                ${itemRows(items)}
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
                ${
                  items.length
                    ? `
                <tr>
                  <td style="padding:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.muted};">
                    Items subtotal
                  </td>
                  <td align="right" style="padding:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.ink};">
                    ${escapeHtml(formatNaira(itemsSubtotal))}
                  </td>
                </tr>`
                    : ""
                }
                ${
                  deliveryFee > 0
                    ? `
                <tr>
                  <td style="padding:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.muted};">
                    Shipping (${escapeHtml(deliveryZoneLabel)})
                  </td>
                  <td align="right" style="padding:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.ink};">
                    ${escapeHtml(formatNaira(deliveryFee))}
                  </td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding-top:8px;border-top:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.muted};">
                    Grand total
                  </td>
                  <td align="right" style="padding-top:8px;border-top:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:900;color:${BRAND.purple};">
                    ${escapeHtml(formatNaira(data.amountNaira))}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND.muted};text-align:right;">
                    ${escapeHtml(data.currency || "NGN")} · Paid via Paystack
                  </td>
                </tr>
              </table>

              <!-- Customer -->
              <div style="margin-top:28px;padding:18px;background:${BRAND.surfaceAlt};border:1px solid ${BRAND.border};">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.purple};">
                  Billed to
                </div>
                <div style="margin-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${BRAND.ink};">
                  <strong>${safeName}</strong><br />
                  ${safeEmail}
                  ${safePhone ? `<br />${safePhone}` : ""}
                </div>
                ${
                  shippingHtml
                    ? `
                <div style="margin-top:16px;padding-top:14px;border-top:1px solid ${BRAND.border};">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.purple};">
                    Shipping address
                  </div>
                  <div style="margin-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${BRAND.ink};">
                    ${shippingHtml}
                  </div>
                </div>`
                    : ""
                }
              </div>

              <div style="margin-top:28px;text-align:center;">
                <a href="${SITE_URL}/store" style="display:inline-block;background:${BRAND.purple};color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;padding:14px 22px;">
                  Continue shopping
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 28px;border-top:1px solid ${BRAND.border};background:${BRAND.surfaceAlt};">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;color:${BRAND.ink};">
                Be Bold. Be Seen. Be Known.
              </div>
              <div style="margin-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                Questions about this order? Write us at
                <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND.purple};text-decoration:none;">${CONTACT_EMAIL}</a>
                <br />
                Printiful Custom Studio · <a href="${SITE_URL}" style="color:${BRAND.purple};text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Convenience wrapper from paid-order input. */
export function renderReceiptFromPaidOrder(order: PaidOrderInput) {
  const data: ReceiptEmailData = {
    reference: order.reference,
    amountNaira: order.amountNaira,
    currency: order.currency,
    customer: order.customer,
    items: order.items,
  };
  return {
    subject: receiptEmailSubject(order.reference),
    html: renderOrderReceiptHtml(data),
    text: renderOrderReceiptText(data),
  };
}
