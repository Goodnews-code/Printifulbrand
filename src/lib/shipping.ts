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

export type OrderShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
};

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
