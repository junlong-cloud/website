import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    // Static hosting serves the original PNG files without lossy optimization.
    unoptimized: true,
  },
};

export default nextConfig;
