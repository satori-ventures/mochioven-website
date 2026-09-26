// Order dates follow the bakery's local time (Las Vegas), not UTC or the
// customer's device time zone.
export const BUSINESS_TIME_ZONE = "America/Los_Angeles";

/** The calendar date ("YYYY-MM-DD") in Las Vegas at the given moment. */
export function businessDateString(at: Date = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

/**
 * True when the chosen date ("YYYY-MM-DD") starts, in Las Vegas time, less
 * than `leadTimeHours` from now: a same-day or rush order.
 */
export function isWithinLeadTime(
  dateStr: string,
  leadTimeHours: number,
  now: Date = new Date()
): boolean {
  if (!dateStr) return false;
  const leadEnd = new Date(now.getTime() + leadTimeHours * 60 * 60 * 1000 - 1);
  return dateStr <= businessDateString(leadEnd);
}
