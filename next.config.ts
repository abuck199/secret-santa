import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    // Our root layout sits under [lang], so unmatched URLs need a standalone
    // 404 page (src/app/global-not-found.tsx); see Next's not-found docs.
    globalNotFound: true,
  },
  // Baseline security headers on every response. No CSP yet: the inline theme
  // script would need a nonce/hash first.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // No framing: stops clickjacking on buttons like "Reserve".
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
        ],
      },
    ];
  },
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
