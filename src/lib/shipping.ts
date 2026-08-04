/** Shipping regions and area fees (Naira) for Printiful checkout. */

export type ShippingRegionId = "mainland" | "island" | "interstate";

export type ShippingArea = {
  id: string;
  name: string;
  fee: number;
};

export type ShippingRegion = {
  id: ShippingRegionId;
  label: string;
  /** Short timing / service note shown at checkout. */
  note: string;
  areas: ShippingArea[];
};

function area(name: string, fee: number): ShippingArea {
  const id = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return { id, name, fee };
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

const INTERSTATE_AREAS = sortAreas([
  area("Ile Ife", 5000),
  area("Ibadan", 4000),
  area("Ilorin", 5000),
  area("Akure", 5000),
  area("Osogbo", 5000),
  area("Abuja", 6000),
  area("Sango Ota", 5000),
  area("Ijebu Ode", 4000),
  area("Oyo Town", 4000),
  area("Ado Ekiti", 5000),
  area("Offa", 5000),
]);

export const SHIPPING_REGIONS: ShippingRegion[] = [
  {
    id: "mainland",
    label: "Mainland",
    note: "Delivery takes place within 2 to 5 working days, depending on the volume of order.",
    areas: MAINLAND_AREAS,
  },
  {
    id: "island",
    label: "Island",
    note: "Delivery takes place within 2 to 5 working days, depending on the volume of order.",
    areas: ISLAND_AREAS,
  },
  {
    id: "interstate",
    label: "Interstate",
    note: "Delivery takes 2 to 5 working days depending on the volume of order. Kindly note that it is park delivery.",
    areas: INTERSTATE_AREAS,
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
};

export function getShippingRegion(
  regionId?: string | null,
): ShippingRegion | null {
  if (!regionId) return null;
  return SHIPPING_REGIONS.find((r) => r.id === regionId) ?? null;
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
  return {
    regionId: region.id,
    regionLabel: region.label,
    areaId: found.id,
    areaName: found.name,
    fee: found.fee,
    label: `${region.label} · ${found.name}`,
    note: region.note,
  };
}

/** @deprecated Prefer getShippingZone — kept for older order payloads. */
export function getDeliveryZoneForState(state?: string | null) {
  if (!state?.trim()) return null;
  const key = state.trim().toLowerCase();
  for (const region of SHIPPING_REGIONS) {
    const area = region.areas.find((a) => a.name.toLowerCase() === key);
    if (area) {
      return {
        id: area.id,
        label: `${region.label} · ${area.name}`,
        state: area.name,
        fee: area.fee,
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
  /** Region: Mainland | Island | Interstate */
  shippingRegion?: string;
  /** Area / town within the region */
  shippingArea?: string;
  /** Full zone label, e.g. "Mainland · Ikeja" */
  deliveryZone?: string;
  /** Shipping fee in Naira included in the paid total */
  deliveryFee?: number;
};

export function formatShippingLines(address: OrderShippingAddress): string[] {
  const lines: string[] = [];
  if (address.deliveryZone?.trim()) {
    lines.push(address.deliveryZone.trim());
  } else if (address.shippingRegion || address.shippingArea) {
    lines.push(
      [address.shippingRegion, address.shippingArea].filter(Boolean).join(" · "),
    );
  }
  lines.push(address.line1.trim());
  if (address.line2?.trim()) lines.push(address.line2.trim());
  const cityState = [address.city.trim(), address.state.trim()]
    .filter(Boolean)
    .join(", ");
  const withPostal = address.postalCode?.trim()
    ? `${cityState} ${address.postalCode.trim()}`
    : cityState;
  if (withPostal && withPostal !== address.deliveryZone?.trim()) {
    lines.push(withPostal);
  }
  if (address.country.trim()) lines.push(address.country.trim());
  return lines.filter(Boolean);
}

export function formatShippingAddress(address: OrderShippingAddress): string {
  return formatShippingLines(address).join("\n");
}

/** Flat list used by shipping policy page. */
export function shippingFeeBullets(): string[] {
  return SHIPPING_REGIONS.flatMap((region) => [
    `${region.label}:`,
    ...region.areas.map((a) => `  ${a.name} — ₦${a.fee.toLocaleString("en-NG")}`),
  ]);
}
