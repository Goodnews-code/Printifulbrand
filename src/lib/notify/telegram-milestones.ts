import type { SupabaseClient } from "@supabase/supabase-js";
import { isSmallBusinessPackageTitle } from "@/lib/packages";
import type { OrderItemSnapshot } from "@/lib/orders";

export type ProductOrderCount = {
  name: string;
  count: number;
  isPackage: boolean;
};

export type OrderMilestones = {
  overall: number;
  products: ProductOrderCount[];
};

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

const OVERALL_SPECIAL_MILESTONES: Record<number, string> = {
  10: "🎯 10th order overall! Double digits unlocked — Printiful is officially on the map!",
  20: "🚀 20th order overall! Twenty customers chose Printiful — the brand is catching fire!",
  50: "🏆 50th order overall! Half a hundred orders — that's real movement. Be proud!",
  100: "💯 100th order overall! TRIPLE DIGITS! Printiful just hit a century — this is legendary!",
  200: "👑 200th order overall! Two hundred orders deep — you're building a real movement!",
  500: "🌟 500th order overall! FIVE HUNDRED orders! Printiful is a force — pause and celebrate this!",
  1000:
    "🎊🔥 1,000th order overall! ONE THOUSAND ORDERS! Printiful legend status — history in the making!",
};

function productSpecialMilestoneLine(
  name: string,
  count: number,
  isPackage: boolean,
): string | null {
  const label = isPackage ? "Small Business Package" : name;

  const messages: Record<number, string> = {
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

function overallMilestoneLine(count: number): string {
  if (count <= 0) return "";
  if (OVERALL_SPECIAL_MILESTONES[count]) {
    return OVERALL_SPECIAL_MILESTONES[count];
  }
  if (count === 1) {
    return "🎉🎊 YOUR FIRST ORDER EVER! Someone just believed in Printiful — this is where it all begins!";
  }
  if (count === 2) {
    return "🔥 2nd order overall! The momentum is real — keep going!";
  }
  if (count === 3) {
    return "✨ 3rd order overall! Word is starting to spread!";
  }
  if (count <= 5) {
    return `⭐ ${ordinal(count)} order overall! Printiful is growing — celebrate this win!`;
  }
  if (count <= 9) {
    return `🚀 ${ordinal(count)} order overall! You're building something special!`;
  }
  return `💜 ${ordinal(count)} order overall! Another customer chose Printiful today!`;
}

function productMilestoneLine(name: string, count: number, isPackage: boolean): string {
  if (count <= 0) return "";

  const special = productSpecialMilestoneLine(name, count, isPackage);
  if (special) return special;

  if (isPackage) {
    if (count === 1) {
      return "🚀📦 1st Small Business Package order! A new entrepreneur just trusted Printiful with their brand!";
    }
    if (count === 2) {
      return "📦✨ 2nd Small Business Package order! Another small business owner is leveling up!";
    }
    if (count <= 5) {
      return `🌟 ${ordinal(count)} Small Business Package order! Entrepreneurs are loving this bundle!`;
    }
    return `💼 ${ordinal(count)} Small Business Package order! The package keeps winning hearts!`;
  }

  if (count === 1) {
    return `🌟 1st order for ${name}! A new favorite just landed in the shop!`;
  }
  if (count === 2) {
    return `💫 2nd order for ${name}! They're coming back for more!`;
  }
  if (count <= 5) {
    return `🔥 ${ordinal(count)} order for ${name}! This product is picking up steam!`;
  }
  return `👕 ${ordinal(count)} order for ${name}! Customers keep choosing this one!`;
}

/** Count successful orders overall and per product name in the current cart. */
export async function fetchOrderMilestones(
  supabase: SupabaseClient,
  items: OrderItemSnapshot[] | undefined,
): Promise<OrderMilestones> {
  const { count: overall, error: countError } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "success");

  if (countError) {
    console.warn("[milestones] overall count failed:", countError.message);
  }

  const productNames = [
    ...new Set(
      (items ?? [])
        .map((item) => item.name.trim())
        .filter(Boolean),
    ),
  ];

  if (productNames.length === 0) {
    return { overall: overall ?? 0, products: [] };
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("payload")
    .eq("status", "success");

  if (ordersError) {
    console.warn("[milestones] product count failed:", ordersError.message);
    return {
      overall: overall ?? 0,
      products: productNames.map((name) => ({
        name,
        count: 0,
        isPackage: isSmallBusinessPackageTitle(name),
      })),
    };
  }

  const productCounts = new Map<string, number>(
    productNames.map((name) => [name, 0]),
  );

  for (const row of orders ?? []) {
    const payload = row.payload as { items?: OrderItemSnapshot[] } | null;
    const namesInOrder = new Set(
      (payload?.items ?? [])
        .map((item) => item.name.trim())
        .filter(Boolean),
    );

    for (const name of productNames) {
      if (namesInOrder.has(name)) {
        productCounts.set(name, (productCounts.get(name) ?? 0) + 1);
      }
    }
  }

  return {
    overall: overall ?? 0,
    products: productNames.map((name) => ({
      name,
      count: productCounts.get(name) ?? 0,
      isPackage: isSmallBusinessPackageTitle(name),
    })),
  };
}

/** Emotional milestone block for the top of Telegram order alerts. Disabled until sales DB tracking is fully active. */
export function formatTelegramMilestoneBlock(_milestones: OrderMilestones): string[] {
  // Milestone order counts disabled until persistent sales database is ready.
  return [];
}
