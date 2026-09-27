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

export function formatFee(fee: number): string {
  if (fee === 0) return "Free";
  return `$${fee}`;
}
