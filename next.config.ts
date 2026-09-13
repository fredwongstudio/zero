import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  distDir: process.env.ZERO_TEST_BUILD === "true" ? ".next-test" : ".next",
  turbopack: { root: path.resolve(process.cwd()) },
  poweredByHeader: false,
  devIndicators: false,
};
export default nextConfig;
