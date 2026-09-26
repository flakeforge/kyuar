import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",

  transpilePackages: ["@kyuar/qr", "@kyuar/shared", "@kyuar/env", "@kyuar/bot"],

  serverExternalPackages: ["@resvg/resvg-js", "grammy"],

  experimental: {
    optimizePackageImports: ["@base-ui/react"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://web.telegram.org",
          },
        ],
      },
    ];
  },
};

export default config;
