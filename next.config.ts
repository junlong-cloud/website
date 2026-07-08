import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Pure client SPA (CloudBase for auth/data) — static export deploys straight
  // to CloudBase's static hosting with no Node server needed.
  output: "export",
};

export default nextConfig;
