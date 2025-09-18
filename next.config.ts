import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  images: {
    unoptimized: false, // Keep optimization enabled
    domains: [], // Add external domains if needed
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
