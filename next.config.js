/** @type {import('next').NextConfig} */
const nextConfig = {
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
