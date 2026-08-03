/** Nigerian states + FCT for checkout state select. */
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

/** Delivery from Lagos — fee in Naira. */
export const DELIVERY_ZONES = [
  {
    id: "lagos",
    label: "Lagos to Lagos",
    state: "Lagos",
    fee: 5500,
  },
  {
    id: "ogun",
    label: "Lagos to Ogun",
    state: "Ogun",
    fee: 8000,
  },
  {
    id: "ondo",
    label: "Lagos to Ondo",
    state: "Ondo",
    fee: 8000,
  },
  {
    id: "oyo",
    label: "Lagos to Oyo",
    state: "Oyo",
    fee: 8000,
  },
  {
    id: "ekiti",
    label: "Lagos to Ekiti",
    state: "Ekiti",
    fee: 8000,
  },
  {
    id: "kwara",
    label: "Lagos to Kwara",
    state: "Kwara",
    fee: 8000,
  },
  {
    id: "abuja",
    label: "Lagos to Abuja",
    state: "FCT - Abuja",
    fee: 9500,
  },
] as const;

export type DeliveryZone = (typeof DELIVERY_ZONES)[number];

export type OrderShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  /** Delivery zone label, e.g. "Lagos to Ogun". */
  deliveryZone?: string;
  /** Delivery fee in Naira included in the paid total. */
  deliveryFee?: number;
};

function normalizeStateKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^fct\s*[-–]?\s*/, "fct - ");
}

/** Resolve delivery fee from selected Nigerian state. */
export function getDeliveryZoneForState(
  state?: string | null,
): DeliveryZone | null {
  if (!state?.trim()) return null;
  const key = normalizeStateKey(state);

  for (const zone of DELIVERY_ZONES) {
    const zoneKey = normalizeStateKey(zone.state);
    if (key === zoneKey) return zone;
  }

  // Aliases for Abuja
  if (
    key === "abuja" ||
    key === "fct" ||
    key === "fct abuja" ||
    key === "federal capital territory"
  ) {
    return DELIVERY_ZONES.find((z) => z.id === "abuja") ?? null;
  }

  return null;
}

export function getDeliveryFeeForState(state?: string | null): number | null {
  return getDeliveryZoneForState(state)?.fee ?? null;
}

export function formatShippingLines(address: OrderShippingAddress): string[] {
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

export function formatShippingAddress(address: OrderShippingAddress): string {
  return formatShippingLines(address).join("\n");
}
