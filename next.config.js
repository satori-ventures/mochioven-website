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
    ];
  },
};

module.exports = nextConfig;
