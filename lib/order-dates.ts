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

/** True for a real calendar date written as "YYYY-MM-DD". */
export function isValidDateString(dateStr: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.toISOString().slice(0, 10) === dateStr;
}

/** Adds whole days to a "YYYY-MM-DD" date. */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Start of a time window such as "11am–1pm" → { hour: 11, minute: 0 }. */
export function parseWindowStart(
  window: string
): { hour: number; minute: number } | null {
  const m = /^\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i.exec(window);
  if (!m) return null;
  const hour12 = Number(m[1]);
  const minute = Number(m[2] ?? 0);
  if (hour12 < 1 || hour12 > 12 || minute > 59) return null;
  const pm = m[3].toLowerCase() === "pm";
  return { hour: (hour12 % 12) + (pm ? 12 : 0), minute };
}

/** Offset of Las Vegas time from UTC at a moment, in minutes (e.g. -420). */
function businessOffsetMinutes(at: Date): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    timeZoneName: "longOffset",
  })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name ?? "");
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

/**
 * A Las Vegas wall-clock time as an RFC 3339 timestamp with the correct offset
 * for that date, e.g. ("2026-12-10", 9, 0) → "2026-12-10T09:00:00-08:00".
 */
export function businessDateTimeToRfc3339(
  dateStr: string,
  hour: number,
  minute: number
): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const wallClockAsUtc = Date.UTC(y, m - 1, d, hour, minute);
  let offset = businessOffsetMinutes(new Date(wallClockAsUtc));
  const corrected = businessOffsetMinutes(
    new Date(wallClockAsUtc - offset * 60_000)
  );
  if (corrected !== offset) offset = corrected;
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dateStr}T${pad(hour)}:${pad(minute)}:00${sign}${pad(
    Math.floor(abs / 60)
  )}:${pad(abs % 60)}`;
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
