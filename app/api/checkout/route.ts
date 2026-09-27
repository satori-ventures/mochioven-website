import { buildPaymentLinkRequest, CatalogMismatchError } from "@/lib/checkout/build-order";
import { siteOrigin } from "@/lib/checkout/site-url";
import {
  MAX_BODY_BYTES,
  OrderValidationError,
  validateOrderRequest,
} from "@/lib/checkout/validate";
import { getCatalogMatch } from "@/lib/square/catalog";
import { getSquareConfig } from "@/lib/square/client";
import { logServerError } from "@/lib/square/log";

type CheckoutResponse = { url: string } | { error: string; message?: string };

function reply(body: CheckoutResponse, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Creates a Square hosted checkout (payment link) for the cart. The browser
 * sends only items, quantities, and form details; all prices, fees, and taxes
 * come from Square and the server.
 */
export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    logServerError("request_too_large");
    return reply({ error: "request_too_large" }, 413);
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    logServerError("request_too_large");
    return reply({ error: "request_too_large" }, 413);
  }

  let order;
  try {
    order = validateOrderRequest(JSON.parse(text));
  } catch (error) {
    if (error instanceof OrderValidationError) {
      logServerError(error.reason, undefined, error.fields ? { fields: error.fields } : undefined);
      return reply({ error: error.reason, message: error.customerMessage }, 400);
    }
    logServerError("invalid_json");
    return reply({ error: "invalid_request" }, 400);
  }

  const config = getSquareConfig();
  if (!config) {
    logServerError("square_not_configured");
    return reply({ error: "checkout_unavailable" }, 503);
  }

  let catalog;
  try {
    catalog = await getCatalogMatch();
    const paymentLinkRequest = buildPaymentLinkRequest({
      order,
      catalog,
      locationId: config.locationId,
      deliveryMode: config.deliveryMode,
      redirectUrl: `${siteOrigin()}/order-confirmed`,
    });
    const result = await config.client.checkout.paymentLinks.create(paymentLinkRequest);
    const url = result.paymentLink?.url;
    if (!url || !url.startsWith("https://")) {
      logServerError("payment_link_missing_url");
      return reply({ error: "checkout_failed" }, 502);
    }
    return reply({ url }, 200);
  } catch (error) {
    logServerError(
      !catalog
        ? "catalog_load_failed"
        : error instanceof CatalogMismatchError
          ? "catalog_item_not_found"
          : "payment_link_failed",
      error,
      // Menu names only, e.g. "The Sampler / Assorted - Half box".
      error instanceof CatalogMismatchError && catalog ? { missing: catalog.missing } : undefined
    );
    return reply({ error: "checkout_failed" }, 502);
  }
}
