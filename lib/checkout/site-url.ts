import "server-only";

const FALLBACK_ORIGIN = "https://mochioven.com";

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
    host === "mochioven.netlify.app" ||
    /^deploy-preview-\d+--mochioven\.netlify\.app$/.test(host)
  );
}

/**
 * The site address for Square's redirect after payment. It never comes from
 * the request's Host header. Candidates, in order: the address Netlify
 * provided at build time (see next.config.js), Netlify's runtime variables if
 * present, and localhost during `next dev`. The first one on the allowlist
 * wins; otherwise https://mochioven.com.
 */
export function siteOrigin(): string {
  const candidates = [
    process.env.CHECKOUT_SITE_URL,
    process.env.CONTEXT === "production" ? process.env.URL : process.env.DEPLOY_PRIME_URL,
    process.env.URL,
    process.env.NODE_ENV === "development"
      ? `http://localhost:${process.env.PORT ?? "3000"}`
      : undefined,
  ];
  for (const candidate of candidates) {
    if (candidate && isAllowedSiteOrigin(candidate)) {
      return new URL(candidate).origin;
    }
  }
  return FALLBACK_ORIGIN;
}
