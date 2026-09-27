import "server-only";
import { SquareClient, SquareEnvironment } from "square";

export type SquareEnvironmentName = "sandbox" | "production";

/**
 * How delivery orders reach Square:
 * - "delivery": a DELIVERY fulfillment on the order (default).
 * - "note_only": no fulfillment; the delivery details go in the payment note.
 */
export type DeliveryMode = "delivery" | "note_only";

export type SquareConfig = {
  client: SquareClient;
  environment: SquareEnvironmentName;
  locationId: string;
  deliveryMode: DeliveryMode;
};

let cachedClient: { key: string; client: SquareClient } | null = null;

/**
 * Reads the Square settings from server environment variables. Returns null
 * when they are missing or invalid, so callers can show a friendly error.
 * The access token is only passed to the Square SDK; it is never logged or
 * returned.
 */
export function getSquareConfig(): SquareConfig | null {
  const token = process.env.SQUARE_ACCESS_TOKEN?.trim();
  const locationId = process.env.SQUARE_LOCATION_ID?.trim();
  const environmentValue = process.env.SQUARE_ENVIRONMENT?.trim().toLowerCase();

  if (!token || !locationId) return null;
  if (environmentValue !== "sandbox" && environmentValue !== "production") {
    return null;
  }
  const environment: SquareEnvironmentName = environmentValue;

  const deliveryMode: DeliveryMode =
    process.env.SQUARE_DELIVERY_MODE?.trim().toLowerCase() === "note_only"
      ? "note_only"
      : "delivery";

  // Reuse one client per environment and token (kept in memory only).
  const key = `${environment}|${token}`;
  if (!cachedClient || cachedClient.key !== key) {
    cachedClient = {
      key,
      client: new SquareClient({
        token,
        environment:
          environment === "production"
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox,
        timeoutInSeconds: 15,
        maxRetries: 1,
      }),
    };
  }

  return { client: cachedClient.client, environment, locationId, deliveryMode };
}
