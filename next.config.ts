import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/conversation',
        destination: '/conversation/index.html',
      },
      {
        source: '/instagram',
        destination: '/conversation/index.html',
      },
    ];
  },
};

export default nextConfig;
