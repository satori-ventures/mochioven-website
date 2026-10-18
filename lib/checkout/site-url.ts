import "server-only";

const FALLBACK_ORIGIN = "https://mochioven.com";

// Vercel preview addresses for this project only, e.g.
// mochioven-website-git-<branch>-<team>.vercel.app or
// mochioven-website-<hash>-<team>.vercel.app. One DNS label, no other domains.
const VERCEL_PREVIEW_HOST = /^mochioven-website-[a-z0-9-]{1,46}\.vercel\.app$/;

/** Site addresses Square may send customers back to after payment. */
export function isAllowedSiteOrigin(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.username || url.password) return false;
  if (url.protocol === "http:") return url.hostname === "localhost";
  if (url.protocol !== "https:" || url.port) return false;
  const host = url.hostname;
  return (
    host === "mochioven.com" ||
    host === "www.mochioven.com" ||
    VERCEL_PREVIEW_HOST.test(host)
  );
}

/**
 * The site address for Square's redirect after payment. It never comes from
 * the request's Host header, only from Vercel's system variables:
 * - preview deployments: the branch address, then the deployment address
 *   (only when it is this project's *.vercel.app preview address);
 * - `next dev`: localhost;
 * - production and anything else: https://mochioven.com.
 */
export function siteOrigin(): string {
  const candidates =
    process.env.VERCEL_ENV === "preview"
      ? [process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL].map((value) => {
          // Vercel sets bare host names; anything else is ignored.
          const host = value?.trim();
          return host && /^[a-z0-9.-]+$/i.test(host) ? `https://${host}` : undefined;
        })
      : process.env.NODE_ENV === "development"
        ? [`http://localhost:${process.env.PORT ?? "3000"}`]
        : [];
  for (const candidate of candidates) {
    if (candidate && isAllowedSiteOrigin(candidate)) {
      return new URL(candidate).origin;
    }
  }
  return FALLBACK_ORIGIN;
}
