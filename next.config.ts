import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
