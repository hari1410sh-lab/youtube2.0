import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
};

export default nextConfig;
