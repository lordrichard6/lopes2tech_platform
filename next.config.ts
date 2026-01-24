import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdfkit", "swissqrbill", "jpeg-exif", "png-js"],
};

export default nextConfig;
