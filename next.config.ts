import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    webSockets: true,
  },
};

export default nextConfig;
