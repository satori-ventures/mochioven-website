import "server-only";
import { SquareError, SquareTimeoutError } from "square";

/**
 * Logs a server-side error without secrets or customer data: only our own
 * reason code and, for Square errors, the HTTP status plus Square's error
 * category, code, and field. Error messages and request bodies are never
 * logged, because they can echo request data.
 */
export function logServerError(
  reason: string,
  error?: unknown,
  /** Extra details that contain no secrets or customer data (e.g. field names). */
  safeDetails?: Record<string, unknown>
): void {
  const details: Record<string, unknown> = { reason, ...safeDetails };
  if (error instanceof SquareTimeoutError) {
    details.square = "timeout";
  } else if (error instanceof SquareError) {
    details.status = error.statusCode;
    details.squareErrors = error.errors.map((e) => ({
      category: e.category,
      code: e.code,
      field: e.field,
    }));
  } else if (error instanceof Error) {
    details.error = error.name;
  }
  console.error("[checkout]", JSON.stringify(details));
}
