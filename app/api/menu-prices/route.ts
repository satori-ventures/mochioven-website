import { getCatalogMatch, SquareNotConfiguredError } from "@/lib/square/catalog";
import { logServerError } from "@/lib/square/log";

/**
 * Menu prices from the Square catalog, in cents, keyed by
 * priceKey(itemId, flavor, size). Prices that cannot be loaded are left out,
 * and the site hides them.
 */
export async function GET() {
  let prices: Record<string, number> = {};
  try {
    const catalog = await getCatalogMatch();
    prices = Object.fromEntries(
      Object.entries(catalog.variations).map(([key, v]) => [key, v.priceCents])
    );
    if (catalog.missing.length > 0) {
      console.warn("[menu-prices]", JSON.stringify({ missing: catalog.missing }));
    }
  } catch (error) {
    logServerError(
      error instanceof SquareNotConfiguredError ? "square_not_configured" : "catalog_load_failed",
      error
    );
  }
  return Response.json(
    { prices },
    { headers: { "Cache-Control": "private, max-age=60" } }
  );
}
