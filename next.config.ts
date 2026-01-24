import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ["pdfkit", "swissqrbill"],
  },
};

export default nextConfig;
