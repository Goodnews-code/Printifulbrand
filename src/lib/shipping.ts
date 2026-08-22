/** Shipping regions and area fees (Naira) for Printiful checkout. */

export type ShippingRegionId = "mainland" | "island" | "outside-lagos";

export const PICKUP_LOCATION = {
  id: "church-bus-stop-ipaja",
  name: "Church bus stop, Ipaja, Lagos Mainland",
  addressLine: "Church bus stop, Ipaja, Lagos Mainland",
  city: "Ipaja",
  state: "Lagos Mainland",
  fee: 0,
} as const;

export type FulfillmentMethod = "delivery" | "pickup";

export type ShippingArea = {
  id: string;
  name: string;
  fee: number;
  /** Nigerian state for Outside Lagos towns (optional). */
  stateName?: string;
};

export type ShippingRegion = {
  id: ShippingRegionId;
  label: string;
  /** Value stored on the shipping address `state` field. */
  addressState: string;
  /** Short timing / service note shown at checkout. */
  note: string;
  areas: ShippingArea[];
};

function area(
  name: string,
  fee: number,
  stateName?: string,
): ShippingArea {
  const id = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return { id, name, fee, ...(stateName ? { stateName } : {}) };
}

function sortAreas(areas: ShippingArea[]): ShippingArea[] {
  return [...areas].sort((a, b) => a.name.localeCompare(b.name));
}

const MAINLAND_AREAS = sortAreas([
  area("Surulere", 6000),
  area("Berger", 4500),
  area("Ogba", 4000),
  area("Iyana Ipaja", 3500),
  area("Egbeda", 3500),
  area("Alakuko", 4500),
  area("Yaba", 5500),
  area("Ikotun", 3500),
  area("Onipanu", 5500),
  area("Oshodi", 5000),
  area("Mushin", 5000),
  area("Unilag", 5500),
  area("Ojota", 5000),
  area("Ayobo", 2500),
  area("Ikeja", 4500),
  area("Alimosho", 3500),
  area("Mofoluku", 4500),
  area("Ojuelegba", 5000),
  area("Akoka", 6000),
  area("Costain", 6000),
  area("Ebute Metta", 6500),
  area("Abule Egba", 4000),
  area("Maryland", 4500),
  area("Palmgrove", 6000),
  area("Fadeyi", 5500),
  area("Shomolu", 6000),
  area("Magodo 1", 5000),
  area("Magodo 2", 5500),
  area("Oyingbo", 7000),
  area("Agric", 2500),
  area("Caleb University Imota", 10000),
  area("Abule Ijesha", 5500),
  area("Iju Ishaga", 4500),
  area("Satellite Town", 6500),
  area("Festac", 6500),
  area("Agege", 4000),
  area("Ifako Ijaiye", 4000),
  area("Apapa", 4000),
  area("Badagry", 9500),
  area("Amuwo Odofin", 6500),
  area("Alakija", 10500),
  area("Igando", 4500),
  area("Alagbado", 3500),
  area("Ilupeju", 5500),
  area("Mile 12", 5500),
  area("Ketu", 5500),
  area("Ajegunle", 6500),
  area("Isolo", 5500),
  area("Mowe", 7500),
  area("Ijegun", 4500),
  area("Isheri Olofin", 3500),
]);

const ISLAND_AREAS = sortAreas([
  area("Ibeju Lekki", 14500),
  area("Chevron", 6000),
  area("Agungi", 9500),
  area("Sangotedo", 10500),
  area("Epe", 15500),
  area("Ikoyi", 7500),
  area("Lekki Phase 1", 8000),
  area("Sagamu", 10500),
  area("Ajah", 10000),
  area("Ikorodu", 8500),
  area("Ikate", 8500),
]);

const OUTSIDE_LAGOS_AREAS = sortAreas([
  area("Ile Ife", 5000, "Osun"),
  area("Ibadan", 4000, "Oyo"),
  area("Ilorin", 5000, "Kwara"),
  area("Akure", 5000, "Ondo"),
  area("Osogbo", 5000, "Osun"),
  area("Abuja", 6000, "FCT - Abuja"),
  area("Sango Ota", 5000, "Ogun"),
  area("Ijebu Ode", 4000, "Ogun"),
  area("Oyo Town", 4000, "Oyo"),
  area("Ado Ekiti", 5000, "Ekiti"),
  area("Offa", 5000, "Kwara"),
]);

export const SHIPPING_REGIONS: ShippingRegion[] = [
  {
    id: "mainland",
    label: "Mainland",
    addressState: "Lagos Mainland",
    note: "Delivery takes place within 2 to 5 working days, depending on the volume of order.",
    areas: MAINLAND_AREAS,
  },
  {
    id: "island",
    label: "Island",
    addressState: "Lagos Island",
    note: "Delivery takes place within 2 to 5 working days, depending on the volume of order.",
    areas: ISLAND_AREAS,
  },
  {
    id: "outside-lagos",
    label: "Outside Lagos",
    addressState: "Outside Lagos",
    note: "Delivery takes 2 to 5 working days depending on the volume of order. Kindly note that it is park delivery.",
    areas: OUTSIDE_LAGOS_AREAS,
  },
];

export type ShippingZoneSelection = {
  regionId: ShippingRegionId;
  regionLabel: string;
  areaId: string;
  areaName: string;
  fee: number;
  /** Display label e.g. "Mainland · Ikeja" */
  label: string;
  note: string;
  /** Synced city for the shipping address */
  city: string;
  /** Synced state / region line for the shipping address */
  state: string;
};

export function getPickupZone(): ShippingZoneSelection {
  return {
    regionId: "mainland",
    regionLabel: "Pickup",
    areaId: PICKUP_LOCATION.id,
    areaName: PICKUP_LOCATION.name,
    fee: PICKUP_LOCATION.fee,
    label: `Pickup · ${PICKUP_LOCATION.name}`,
    note: "Collect your order in person when it is ready. No delivery fee.",
    city: PICKUP_LOCATION.city,
    state: PICKUP_LOCATION.state,
  };
}

export function getShippingRegion(
  regionId?: string | null,
): ShippingRegion | null {
  if (!regionId) return null;
  // Legacy checkout id
  const normalized =
    regionId === "interstate" ? "outside-lagos" : regionId;
  return SHIPPING_REGIONS.find((r) => r.id === normalized) ?? null;
}

export function getShippingZone(
  regionId?: string | null,
  areaId?: string | null,
): ShippingZoneSelection | null {
  const region = getShippingRegion(regionId);
  if (!region || !areaId) return null;
  const found = region.areas.find(
    (a) => a.id === areaId || a.name.toLowerCase() === areaId.toLowerCase(),
  );
  if (!found) return null;

  const state =
    region.id === "outside-lagos"
      ? found.stateName || region.addressState
      : region.addressState;

  return {
    regionId: region.id,
    regionLabel: region.label,
    areaId: found.id,
    areaName: found.name,
    fee: found.fee,
    label: `${region.label} · ${found.name}`,
    note: region.note,
    city: found.name,
    state,
  };
}

/** Outside-Lagos towns that ship to a given Nigerian state. */
export function getOutsideLagosAreasForState(
  state?: string | null,
): ShippingArea[] {
  if (!state?.trim()) return [];
  const key = state.trim().toLowerCase();
  return OUTSIDE_LAGOS_AREAS.filter((area) => {
    const areaState = (area.stateName || "").toLowerCase();
    if (!areaState) return false;
    if (areaState === key) return true;
    // Abuja aliases
    if (
      (key === "abuja" || key.includes("abuja") || key.startsWith("fct")) &&
      areaState.includes("abuja")
    ) {
      return true;
    }
    return false;
  });
}

/** States that currently have Outside Lagos delivery rates. */
export function getOutsideLagosServedStates(): string[] {
  const set = new Set<string>();
  for (const area of OUTSIDE_LAGOS_AREAS) {
    if (area.stateName) set.add(area.stateName);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** @deprecated Prefer getShippingZone — kept for older order payloads. */
export function getDeliveryZoneForState(state?: string | null) {
  if (!state?.trim()) return null;
  const key = state.trim().toLowerCase();
  for (const region of SHIPPING_REGIONS) {
    const found = region.areas.find((a) => a.name.toLowerCase() === key);
    if (found) {
      return {
        id: found.id,
        label: `${region.label} · ${found.name}`,
        state: found.name,
        fee: found.fee,
      };
    }
  }
  return null;
}

export type OrderShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  /** Region: Mainland | Island | Outside Lagos */
  shippingRegion?: string;
  /** Area / town within the region */
  shippingArea?: string;
  /** Full zone label, e.g. "Mainland · Ikeja" */
  deliveryZone?: string;
  /** Shipping fee in Naira included in the paid total */
  deliveryFee?: number;
};

/** Billing address — may match shipping or be entered separately. */
export type OrderBillingAddress = {
  sameAsShipping: boolean;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
};

/** Nigerian states + FCT for billing address select. */
export const NIGERIA_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export function billingFromShipping(
  shipping: OrderShippingAddress,
): OrderBillingAddress {
  return {
    sameAsShipping: true,
    line1: shipping.line1,
    line2: shipping.line2,
    city: shipping.city,
    state: shipping.state,
    postalCode: shipping.postalCode,
    country: shipping.country,
  };
}

export function formatBillingLines(address: OrderBillingAddress): string[] {
  const lines = [address.line1.trim()];
  if (address.line2?.trim()) lines.push(address.line2.trim());
  const cityState = [address.city.trim(), address.state.trim()]
    .filter(Boolean)
    .join(", ");
  const withPostal = address.postalCode?.trim()
    ? `${cityState} ${address.postalCode.trim()}`
    : cityState;
  if (withPostal) lines.push(withPostal);
  if (address.country.trim()) lines.push(address.country.trim());
  return lines.filter(Boolean);
}

export function formatBillingAddress(address: OrderBillingAddress): string {
  return formatBillingLines(address).join("\n");
}

export function formatShippingLines(address: OrderShippingAddress): string[] {
  const lines: string[] = [];
  const zone =
    address.deliveryZone?.trim() ||
    [address.shippingRegion, address.shippingArea].filter(Boolean).join(" · ");
  if (zone) lines.push(zone);

  if (address.line1.trim()) lines.push(address.line1.trim());
  if (address.line2?.trim()) lines.push(address.line2.trim());

  const city = address.city.trim();
  const state = address.state.trim();
  // Avoid repeating area/region already shown in the zone line
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

export function formatShippingAddress(address: OrderShippingAddress): string {
  return formatShippingLines(address).join("\n");
}

/** Flat list used by shipping policy page. */
export function shippingFeeBullets(): string[] {
  return [
    `Pickup · ${PICKUP_LOCATION.name} — Free`,
    ...SHIPPING_REGIONS.flatMap((region) => [
      `${region.label}:`,
      ...region.areas.map(
        (a) => `  ${a.name} — ₦${a.fee.toLocaleString("en-NG")}`,
      ),
    ]),
  ];
}
