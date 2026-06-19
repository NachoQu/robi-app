import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the file-tracing root to this project. Without this, Next infers the
  // workspace root from the nearest lockfile and can pick a parent directory
  // (e.g. ~/package-lock.json), which breaks the serverless bundle on Vercel
  // with "ReferenceError: __dirname is not defined" at runtime.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
