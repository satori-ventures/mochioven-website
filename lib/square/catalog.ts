import "server-only";
import { unstable_cache } from "next/cache";
import type { Square } from "square";
import {
  menuItems,
  menuVariants,
  normalizeCatalogName,
  priceKey,
} from "@/lib/menu-data";
import { getSquareConfig, type SquareConfig } from "@/lib/square/client";

export type CatalogVariation = {
  variationId: string;
  priceCents: number;
};

export type CatalogMatch = {
  /** Keyed by priceKey(itemId, flavor, size). */
  variations: Record<string, CatalogVariation>;
  /** Menu entries not found in the catalog, e.g. "Mochi Cake / Citrus Matcha - 1 dozen". */
  missing: string[];
};

export class SquareNotConfiguredError extends Error {
  name = "SquareNotConfiguredError";
}

function isAtLocation(
  obj: { presentAtAllLocations?: boolean; presentAtLocationIds?: string[]; absentAtLocationIds?: string[] },
  locationId: string
): boolean {
  if (obj.presentAtAllLocations !== false) {
    return !(obj.absentAtLocationIds ?? []).includes(locationId);
  }
  return (obj.presentAtLocationIds ?? []).includes(locationId);
}

/** The fixed USD price of a variation at the location, in cents, if any. */
function variationPriceCents(
  data: Square.CatalogItemVariation,
  locationId: string
): number | null {
  const override = data.locationOverrides?.find((o) => o.locationId === locationId);
  const pricingType = override?.pricingType ?? data.pricingType;
  const money = override?.priceMoney ?? data.priceMoney;
  if (override?.soldOut) return null;
  if (pricingType !== "FIXED_PRICING" || !money || money.amount == null) return null;
  if (money.currency !== "USD") return null;
  const cents = Number(money.amount);
  return Number.isSafeInteger(cents) && cents >= 0 ? cents : null;
}

async function loadCatalog(config: SquareConfig): Promise<CatalogMatch> {
  const { client, locationId } = config;

  // Items by normalized name. A name used twice is ambiguous.
  const byName = new Map<string, Square.CatalogObject.Item[]>();
  const page = await client.catalog.list({ types: "ITEM" });
  for await (const obj of page) {
    if (obj.type !== "ITEM" || obj.isDeleted || !obj.itemData?.name) continue;
    if (obj.itemData.isArchived) continue;
    const key = normalizeCatalogName(obj.itemData.name);
    byName.set(key, [...(byName.get(key) ?? []), obj]);
  }

  const variations: Record<string, CatalogVariation> = {};
  const missing: string[] = [];

  for (const menuItem of menuItems) {
    const matches = byName.get(normalizeCatalogName(menuItem.name)) ?? [];
    const item = matches.length === 1 ? matches[0] : undefined;
    const itemUsable = item ? isAtLocation(item, locationId) : false;

    for (const variant of menuVariants().filter((v) => v.item.id === menuItem.id)) {
      const label = `${menuItem.name} / ${variant.catalogVariationName}`;
      if (!item || !itemUsable) {
        missing.push(matches.length > 1 ? `${label} (item name used more than once)` : label);
        continue;
      }
      const wanted = normalizeCatalogName(variant.catalogVariationName);
      const found = (item.itemData?.variations ?? []).filter(
        (v): v is Square.CatalogObject.ItemVariation =>
          v.type === "ITEM_VARIATION" &&
          !v.isDeleted &&
          v.itemVariationData?.sellable !== false &&
          normalizeCatalogName(v.itemVariationData?.name ?? "") === wanted &&
          isAtLocation(v, locationId)
      );
      const priceCents =
        found.length === 1 && found[0].itemVariationData
          ? variationPriceCents(found[0].itemVariationData, locationId)
          : null;
      if (found.length !== 1 || priceCents === null) {
        missing.push(found.length > 1 ? `${label} (variation name used more than once)` : label);
        continue;
      }
      variations[priceKey(menuItem.id, variant.flavor, variant.size)] = {
        variationId: found[0].id,
        priceCents,
      };
    }
  }

  return { variations, missing };
}

/**
 * The catalog matched to the menu, cached for about 5 minutes per environment
 * and location. Throws when Square is not configured or cannot be reached;
 * failures are not cached.
 */
export async function getCatalogMatch(): Promise<CatalogMatch> {
  const config = getSquareConfig();
  if (!config) throw new SquareNotConfiguredError();
  const cached = unstable_cache(
    () => loadCatalog(config),
    ["square-catalog", config.environment, config.locationId],
    { revalidate: 300 }
  );
  return cached();
}
