/**
 * Dry-run (and optional live send) for Small Business Package Telegram alerts.
 * Usage: node scripts/test-package-telegram.mjs [--send]
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

function formatNaira(amount) {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatShippingLines(address) {
  const lines = [];
  const zone =
    address.deliveryZone?.trim() ||
    [address.shippingRegion, address.shippingArea].filter(Boolean).join(" · ");
  if (zone) lines.push(zone);

  if (address.line1.trim()) lines.push(address.line1.trim());
  if (address.line2?.trim()) lines.push(address.line2.trim());

  const city = address.city.trim();
  const state = address.state.trim();
  const cityAlreadyInZone =
    Boolean(zone) &&
    city &&
    zone.toLowerCase().includes(city.toLowerCase());
  const stateAlreadyInZone =
    Boolean(zone) &&
    state &&
    zone.toLowerCase().includes(state.toLowerCase());

  const locationParts = [
    cityAlreadyInZone ? null : city || null,
    stateAlreadyInZone ? null : state || null,
  ].filter(Boolean);

  const location = locationParts.join(", ");
  const withPostal = address.postalCode?.trim()
    ? location
      ? `${location} ${address.postalCode.trim()}`
      : address.postalCode.trim()
    : location;
  if (withPostal) lines.push(withPostal);

  if (address.country.trim()) lines.push(address.country.trim());
  return lines.filter(Boolean);
}

function formatShippingAddress(address) {
  return formatShippingLines(address).join("\n");
}

/** Mirrors src/lib/notify/telegram-milestones.ts */
function ordinal(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

const OVERALL_SPECIAL_MILESTONES = {
  10: "🎯 10th order overall! Double digits unlocked — Printiful is officially on the map!",
  20: "🚀 20th order overall! Twenty customers chose Printiful — the brand is catching fire!",
  50: "🏆 50th order overall! Half a hundred orders — that's real movement. Be proud!",
  100: "💯 100th order overall! TRIPLE DIGITS! Printiful just hit a century — this is legendary!",
  200: "👑 200th order overall! Two hundred orders deep — you're building a real movement!",
  500: "🌟 500th order overall! FIVE HUNDRED orders! Printiful is a force — pause and celebrate this!",
  1000: "🎊🔥 1,000th order overall! ONE THOUSAND ORDERS! Printiful legend status — history in the making!",
};

function productSpecialMilestoneLine(name, count, isPackage) {
  const label = isPackage ? "Small Business Package" : name;
  const messages = {
    10: `🏅 10th order for ${label}! Ten times chosen — ${isPackage ? "entrepreneurs are noticing this bundle!" : "this product has found its people!"}`,
    20: `💫 20th order for ${label}! Twenty believers — ${isPackage ? "a rising star for small business owners!" : "a certified crowd favorite!"}`,
    50: `🏆 50th order for ${label}! Fifty orders strong — ${isPackage ? "the package is becoming a Printiful staple!" : "this one is a Printiful staple!"}`,
    100: `💯 100th order for ${label}! A century of sales — ${isPackage ? "hall-of-fame bundle energy!" : "icon status unlocked!"}`,
    200: `👑 200th order for ${label}! Two hundred orders — ${isPackage ? "this bundle is carrying the brand!" : "this product is carrying the brand!"}`,
    500: `🌟 500th order for ${label}! Five hundred times sold — absolute Printiful classic!`,
    1000: `🎊 1,000th order for ${label}! ONE THOUSAND orders — hall of fame ${isPackage ? "package" : "product"}!`,
  };
  return messages[count] ?? null;
}

function overallMilestoneLine(count) {
  if (count <= 0) return "";
  if (OVERALL_SPECIAL_MILESTONES[count]) return OVERALL_SPECIAL_MILESTONES[count];
  if (count === 1) return "🎉🎊 YOUR FIRST ORDER EVER! Someone just believed in Printiful — this is where it all begins!";
  if (count === 2) return "🔥 2nd order overall! The momentum is real — keep going!";
  if (count === 3) return "✨ 3rd order overall! Word is starting to spread!";
  if (count <= 5) return `⭐ ${ordinal(count)} order overall! Printiful is growing — celebrate this win!`;
  if (count <= 9) return `🚀 ${ordinal(count)} order overall! You're building something special!`;
  return `💜 ${ordinal(count)} order overall! Another customer chose Printiful today!`;
}

function productMilestoneLine(name, count, isPackage) {
  if (count <= 0) return "";
  const special = productSpecialMilestoneLine(name, count, isPackage);
  if (special) return special;
  if (isPackage) {
    if (count === 1) return "🚀📦 1st Small Business Package order! A new entrepreneur just trusted Printiful with their brand!";
    if (count === 2) return "📦✨ 2nd Small Business Package order! Another small business owner is leveling up!";
    if (count <= 5) return `🌟 ${ordinal(count)} Small Business Package order! Entrepreneurs are loving this bundle!`;
    return `💼 ${ordinal(count)} Small Business Package order! The package keeps winning hearts!`;
  }
  if (count === 1) return `🌟 1st order for ${name}! A new favorite just landed in the shop!`;
  if (count === 2) return `💫 2nd order for ${name}! They're coming back for more!`;
  if (count <= 5) return `🔥 ${ordinal(count)} order for ${name}! This product is picking up steam!`;
  return `👕 ${ordinal(count)} order for ${name}! Customers keep choosing this one!`;
}

function formatTelegramMilestoneBlock(milestones) {
  const lines = ["✨ Order milestones"];
  const overallLine = overallMilestoneLine(milestones.overall);
  if (overallLine) lines.push(overallLine);
  for (const product of milestones.products) {
    const line = productMilestoneLine(product.name, product.count, product.isPackage);
    if (line) lines.push(line);
  }
  return lines.length > 1 ? lines : [];
}

/** Mirrors src/lib/orders.ts buildTelegramText */
function buildTelegramText(order, milestones) {
  const lines = [];

  if (milestones) {
    const milestoneLines = formatTelegramMilestoneBlock(milestones);
    if (milestoneLines.length > 0) {
      lines.push(...milestoneLines, "");
    }
  }

  lines.push(
    "New Printiful order",
    "",
    `Ref: ${order.reference}`,
    `Amount: ${formatNaira(order.amountNaira)} ${order.currency}`,
    `Customer: ${order.customer.name}`,
    `Email: ${order.customer.email}`,
  );

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
    }
  }

  if (order.items && order.items.length > 0) {
    lines.push("", "Items:");
    for (const item of order.items) {
      const size =
        item.size && item.size !== "One Size" ? item.size : null;
      const color =
        item.color && item.color !== "—" && item.color !== "Default"
          ? item.color
          : null;
      const inlineMeta = [size, color && !color.includes("\n") ? color : null]
        .filter(Boolean)
        .join(" · ");
      const label = inlineMeta ? `${item.name} (${inlineMeta})` : item.name;
      lines.push(
        `• ${label} × ${item.qty} — ${formatNaira(item.price * item.qty)}`,
      );
      if (color && color.includes("\n")) {
        for (const line of color.split("\n")) {
          if (line.trim()) lines.push(`  ${line.trim()}`);
        }
      }
    }
    const itemsSubtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    lines.push(`Items subtotal: ${formatNaira(itemsSubtotal)}`);
  }

  return lines.join("\n");
}

function cleanEnv(value) {
  if (!value) return "";
  return value
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim()
    .replace(/[\u2010-\u2015\u2212]/g, "-");
}

function parseChatId(raw) {
  if (/^-?\d+$/.test(raw)) return Number(raw);
  return raw;
}

async function sendTelegramMessage(text) {
  const token = cleanEnv(process.env.TELEGRAM_BOT_TOKEN);
  const chatIdRaw = cleanEnv(process.env.TELEGRAM_CHAT_ID);
  const chatId = chatIdRaw ? parseChatId(chatIdRaw) : "";

  if (!token || !chatIdRaw) {
    const missing = [
      !token ? "TELEGRAM_BOT_TOKEN" : null,
      !chatIdRaw ? "TELEGRAM_CHAT_ID" : null,
    ]
      .filter(Boolean)
      .join(", ");
    return { ok: false, skipped: true, error: `Missing ${missing}` };
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  const body = await res.text().catch(() => "");
  if (!res.ok) {
    return { ok: false, error: `Telegram API ${res.status}: ${body.slice(0, 300)}` };
  }

  return { ok: true };
}

const samplePackageColor = [
  "Poly bag artwork/layout: Minimal purple layout with logo top-left",
  "Poly bag printed wording: Thank you for shopping with us",
  "Poly bag logo file: https://example.com/package-logos/test-logo.webp",
  "Thank you card: We appreciate your order — Printiful team",
  "Tee 1 color: Purple",
  "Tee 1 design: Brand name on front chest",
  "Tee 2 color: Yellow",
  "Tee 2 design: Logo on back",
].join("\n");

const sampleOrder = {
  reference: `PRNTFL-TEST-PKG-${Date.now()}`,
  amountNaira: 67_000,
  currency: "NGN",
  customer: {
    name: "Test Customer (Package dry run)",
    email: "test@printiful.local",
    phone: "08012345678",
    shipping: {
      line1: "Church bus stop, Ipaja, Lagos Mainland",
      city: "Ipaja",
      state: "Lagos Mainland",
      country: "Nigeria",
      shippingRegion: "Pickup",
      shippingArea: "Church bus stop, Ipaja, Lagos Mainland",
      deliveryZone: "Pickup · Church bus stop, Ipaja, Lagos Mainland",
      deliveryFee: 0,
    },
    billing: {
      sameAsShipping: true,
      line1: "Church bus stop, Ipaja, Lagos Mainland",
      city: "Ipaja",
      state: "Lagos Mainland",
      country: "Nigeria",
    },
  },
  items: [
    {
      name: "Premium Heavyweight Tee",
      qty: 1,
      price: 12_000,
      size: "L",
      color: "Purple",
    },
    {
      name: "Small Business Package",
      qty: 1,
      price: 55_000,
      size: "Package",
      color: samplePackageColor,
    },
  ],
};

const sampleMilestones = {
  overall: 5,
  products: [
    { name: "Premium Heavyweight Tee", count: 4, isPackage: false },
    { name: "Small Business Package", count: 1, isPackage: true },
  ],
};

const message = buildTelegramText(sampleOrder, sampleMilestones);

console.log("--- Telegram preview (Small Business Package) ---\n");
console.log(message);
console.log("\n--- End preview ---");

const hasDetails = [
  "✨ Order milestones",
  "5th order overall",
  "4th order for Premium Heavyweight Tee",
  "1st Small Business Package order",
  "Poly bag artwork/layout:",
  "Poly bag printed wording:",
  "Poly bag logo file:",
  "Thank you card:",
  "Tee 1 color:",
  "Tee 1 design:",
  "Tee 2 color:",
  "Tee 2 design:",
].every((line) => message.includes(line));

console.log(
  hasDetails
    ? "\n✓ All package customization lines are present in the Telegram message."
    : "\n✗ Some package lines are missing from the Telegram message.",
);

const shouldSend = process.argv.includes("--send");
if (!shouldSend) {
  console.log("\nDry run only. Pass --send to post a live Telegram test message.");
  process.exit(hasDetails ? 0 : 1);
}

const result = await sendTelegramMessage(
  `[TEST — package order]\n\n${message}`,
);
console.log("\nTelegram send result:", result);
process.exit(result.ok && hasDetails ? 0 : 1);
