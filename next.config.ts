import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Optimize images — serve AVIF/WebP, allow local + ohho-images domain
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 375, 414, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
  },
  // Remove console.log in production (keep errors + warnings)
  compiler: {
    removeConsole: {
      exclude: ["error", "warn"],
    },
  },
  // Compress responses
  compress: true,
};

export default nextConfig;
