import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Pure client SPA (CloudBase for auth/data) — static export deploys straight
  // to CloudBase's static hosting with no Node server needed.
  output: "export",
  // Emit <route>/index.html instead of <route>.html — plain static file hosts
  // (unlike `next dev`'s router) only resolve a request for "/c/" to a literal
  // "c/index.html" file on disk, not to a sibling "c.html".
  trailingSlash: true,
};

export default nextConfig;
