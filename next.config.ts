import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  output: "standalone",
  images: {
    unoptimized: false, // Keep optimization enabled
    domains: [], // Add external domains if needed
    formats: ["image/webp", "image/avif"],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
};

export default nextConfig;
