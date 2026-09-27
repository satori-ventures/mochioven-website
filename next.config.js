/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Turbopack's build cache stores a copy of the build environment, including
    // secret values (e.g. SQUARE_ACCESS_TOKEN), which fails Netlify's secret scan.
    turbopackFileSystemCacheForBuild: false,
  },
  env: {
    // Public site address for Square's redirect after payment. Netlify only
    // provides URL / DEPLOY_PRIME_URL during the build, so capture it here.
    // Checked against an allowlist in lib/checkout/site-url.ts.
    CHECKOUT_SITE_URL:
      (process.env.CONTEXT === "production"
        ? process.env.URL
        : process.env.DEPLOY_PRIME_URL) ?? "",
  },
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        source: "/order",
        destination: "https://themochiovenbakery.square.site",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
