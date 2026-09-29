import { siteConfig } from "@/lib/site-config";

export type FulfillmentType = "pickup" | "delivery";

export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

export const SUMMERLIN_ZIPS: readonly string[] = siteConfig.order.summerlinZips;
export const DELIVERY_ZIPS_OUTSIDE_SUMMERLIN: readonly string[] =
  siteConfig.order.deliveryZipsOutsideSummerlin;

export function isSummerlinZip(zip: string): boolean {
  return SUMMERLIN_ZIPS.includes(zip);
}

/**
 * Pickup: the pickup fee. Delivery: $5 for Summerlin ZIPs, $10 for the listed
 * Las Vegas ZIPs. Returns null when the ZIP is not a valid 5-digit ZIP or is
 * outside the delivery area (use isValidZip to tell the two apart).
 */
export function getDeliveryFee(
  fulfillment: FulfillmentType,
  zip?: string
): number | null {
  if (fulfillment === "pickup") {
    return siteConfig.order.pickupFee;
  }
  if (!zip || !isValidZip(zip)) {
    return null;
  }
  if (isSummerlinZip(zip)) {
    return siteConfig.order.summerlinDeliveryFee;
  }
  if (DELIVERY_ZIPS_OUTSIDE_SUMMERLIN.includes(zip)) {
    return siteConfig.order.outsideSummerlinDeliveryFee;
  }
  return null;
}

const US_STATES =
  "Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|" +
  "District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|" +
  "Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|" +
  "Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|" +
  "New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|" +
  "Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|" +
  "Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming|" +
  "AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|" +
  "MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|" +
  "WV|WI|WY";

// A 5-digit number (optionally ZIP+4) right after a state name or abbreviation.
const ZIP_AFTER_STATE = new RegExp(
  `\\b(?:${US_STATES})\\.?[\\s,]*(\\d{5})(?:-\\d{4})?(?!\\d)`,
  "gi"
);
// A 5-digit number (optionally ZIP+4) at the end of the field, after other text.
const ZIP_AT_END = /\S\s*[\s,]\s*(\d{5})(?:-\d{4})?\s*$/;

/**
 * 5-digit numbers in an address field that look like ZIP codes: after a state
 * name or abbreviation ("NV 89101"), or at the end of the field
 * ("123 Main St 89101"). House numbers such as "12420 Main St" are not ZIPs.
 */
export function zipsInAddressText(text: string): string[] {
  const zips = new Set<string>();
  for (const m of Array.from(text.matchAll(ZIP_AFTER_STATE))) zips.add(m[1]);
  const end = ZIP_AT_END.exec(text);
  if (end) zips.add(end[1]);
  return Array.from(zips);
}

/**
 * True when the street address or apt field contains a ZIP code that differs
 * from the ZIP field. Used by the checkout form and the server.
 */
export function addressZipMismatch(address: string, address2: string, zip: string): boolean {
  return [address, address2].some((field) =>
    zipsInAddressText(field).some((found) => found !== zip.trim())
  );
}

export const ADDRESS_ZIP_MISMATCH_MESSAGE =
  "The ZIP code in your address doesn't match the ZIP code field. Please check both.";

export const DELIVERY_MINIMUM_CENTS = Math.round(siteConfig.order.deliveryMinimum * 100);

/**
 * Cents still needed to reach the delivery minimum; 0 when it is met or for
 * pickup. `subtotalCents` is the items only, before the delivery fee and tax.
 */
export function deliveryShortfallCents(
  fulfillment: FulfillmentType,
  subtotalCents: number
): number {
  if (fulfillment !== "delivery") return 0;
  return Math.max(0, DELIVERY_MINIMUM_CENTS - subtotalCents);
}

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function deliveryMinimumMessage(shortfallCents: number): string {
  return `Delivery orders have a ${dollars(DELIVERY_MINIMUM_CENTS)} minimum. Add ${dollars(shortfallCents)} more, or choose pickup.`;
}

export function formatFee(fee: number): string {
  if (fee === 0) return "Free";
  return `$${fee}`;
}
