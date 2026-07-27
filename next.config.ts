import type { NextConfig } from "next";
import { join } from "node:path";

const cloudbaseBrowserSdk = join(
  process.cwd(),
  "node_modules",
  "@cloudbase",
  "js-sdk",
  "dist",
  "index.esm.js"
).replace(/\\/g, "/");

const nextConfig: NextConfig = {
  /* config options here */
  // Pure client SPA (CloudBase for auth/data) — static export deploys straight
  // to CloudBase's static hosting with no Node server needed.
  output: "export",
  // Emit <route>/index.html instead of <route>.html — plain static file hosts
  // (unlike `next dev`'s router) only resolve a request for "/c/" to a literal
  // "c/index.html" file on disk, not to a sibling "c.html".
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.alias["@cloudbase/js-sdk"] = cloudbaseBrowserSdk;
    return config;
  },
};

export default nextConfig;
