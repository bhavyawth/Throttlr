import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Transpile monorepo packages
  transpilePackages: ["@throttlr/types"],

  // API rewrites for development proxy (remove if API is on same domain)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/v1"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
