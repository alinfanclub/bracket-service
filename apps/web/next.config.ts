import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@judo-bracket/config", "@judo-bracket/types", "@judo-bracket/ui", "@judo-bracket/utils"]
};

export default nextConfig;
