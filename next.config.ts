import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  productionBrowserSourceMaps: false, 
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all external images (dev only)
      },
    ],
  },
};

export default nextConfig;
