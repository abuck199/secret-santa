import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Sign-up and sign-in are one email-code flow now; keep old links working.
  async redirects() {
    return [
      { source: "/signup", destination: "/login", permanent: true },
      { source: "/fr/signup", destination: "/fr/login", permanent: true },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
