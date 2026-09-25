import { siteConfig } from "@/lib/site-config";

export type FulfillmentType = "pickup" | "delivery";

export function parsePrice(price: string | undefined): number {
  if (!price) return 0;
  const match = price.match(/\$([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

export function isSummerlinZip(zip: string): boolean {
  return (siteConfig.order.summerlinZips as readonly string[]).includes(zip);
}

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
  return siteConfig.order.outsideSummerlinDeliveryFee;
}

export function formatFee(fee: number): string {
  if (fee === 0) return "Free";
  return `$${fee}`;
}
