/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Turbopack's build cache stores a copy of the build environment, including
    // secret values (e.g. SQUARE_ACCESS_TOKEN), which fails Netlify's secret scan.
    turbopackFileSystemCacheForBuild: false,
  },
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        source: "/order",
        destination: "https://themochiovenbakery.square.site",
        permanent: true,
      },
      // QR codes. 302 (temporary), so browsers do not cache them and the
      // destination can change later without reprinting the codes.
      {
        source: "/qr",
        destination: "/?utm_source=label&utm_medium=qr&utm_campaign=box_label",
        statusCode: 302,
      },
      {
        source: "/card",
        destination: "/?utm_source=business_card&utm_medium=qr&utm_campaign=business_card",
        statusCode: 302,
      },
    ];
  },
};

module.exports = nextConfig;
