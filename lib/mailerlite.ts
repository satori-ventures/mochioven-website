import "server-only";

// MailerLite API: "Create/upsert subscriber"
// https://developers.mailerlite.com/docs/subscribers.html
const SUBSCRIBERS_URL = "https://connect.mailerlite.com/api/subscribers";
const TIMEOUT_MS = 3000;

function log(level: "warn" | "error", details: Record<string, unknown>): void {
  console[level]("[mailerlite]", JSON.stringify(details));
}

/** The first word of the customer's name, e.g. "Jane" for "Jane Customer". */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/**
 * Adds the email and first name to the MailerLite group in MAILERLITE_GROUP_ID.
 * Never throws and gives up after 3 seconds, so it cannot affect checkout.
 * The API key is only sent to MailerLite. Logs carry our reason code and the
 * HTTP status only: never the email, the name, or MailerLite's response body.
 *
 * The request does not set `status` or `resubscribe`, so it does not
 * resubscribe someone who unsubscribed earlier.
 */
export async function addMarketingSubscriber(email: string, firstName: string): Promise<void> {
  const apiKey = process.env.MAILERLITE_API_KEY?.trim();
  const groupId = process.env.MAILERLITE_GROUP_ID?.trim();
  if (!apiKey || !groupId) {
    log("warn", { reason: "not_configured" });
    return;
  }
  try {
    const res = await fetch(SUBSCRIBERS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        ...(firstName ? { fields: { name: firstName } } : {}),
        groups: [groupId],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) log("error", { reason: "signup_failed", status: res.status });
  } catch (error) {
    const name = error instanceof Error ? error.name : "unknown";
    log("error", {
      reason: name === "TimeoutError" || name === "AbortError" ? "signup_timeout" : "signup_error",
      error: name,
    });
  }
}
