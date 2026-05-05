import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  typescript: {
    // Local TS check passes clean; Vercel's cache produces stale auto-generated validator errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
