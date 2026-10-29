import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const vercelEnv = process.env.VERCEL_ENV; // "production" | "preview" on Vercel builds

// Fail Vercel builds without real Turnstile keys, instead of shipping a sign-in
// page whose bot check silently uses Cloudflare's always-pass test keys. The
// live site keeps the previous deployment until the keys are set.
if ((vercelEnv === "production" || vercelEnv === "preview") &&
  (!process.env.TURNSTILE_SECRET_KEY || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)) {
  throw new Error("Set TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY for this Vercel environment.");
}

// Content Security Policy, the "without nonces" variant from Next's CSP guide:
// nonces would force every page to render per request (no prerendering, no
// CDN cache). Inline scripts stay allowed (Next's own and our theme script);
// scripts, frames and requests to other origins are blocked except the ones
// we use. See node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md.
const turnstile = "https://challenges.cloudflare.com";
// Vercel's feedback toolbar, injected on preview deployments only.
const toolbar = vercelEnv === "preview"
  ? { script: " https://vercel.live", connect: " https://vercel.live wss://ws-us3.pusher.com",
      img: " https://vercel.live https://vercel.com", font: " https://vercel.live https://assets.vercel.com",
      frame: " https://vercel.live" }
  : { script: "", connect: "", img: "", font: "", frame: "" };
// In dev, React needs eval for debugging and Vercel Analytics loads a debug script.
const devScripts = isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : "";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${turnstile}${devScripts}${toolbar.script}`,
  `style-src 'self' 'unsafe-inline'${toolbar.script}`,
  // https: for wishlist product photos, hotlinked from the shops' own sites
  // (any shop, so no host list). Images can't run code; scripts stay locked.
  `img-src 'self' blob: data: https:${toolbar.img}`,
  `font-src 'self'${toolbar.font}`,
  `connect-src 'self'${isDev ? " https://va.vercel-scripts.com" : ""}${toolbar.connect}`,
  `frame-src ${turnstile}${toolbar.frame}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    // Our root layout sits under [lang], so unmatched URLs need a standalone
    // 404 page (src/app/global-not-found.tsx); see Next's not-found docs.
    globalNotFound: true,
    // Turbopack's on-disk cache (on by default since 16.3, and restored by
    // Vercel between deployments) kept serving stale Tailwind output after
    // globals.css changed: production shipped old tokens with new markup.
    // Slower cold builds are the price of always-correct CSS.
    turbopackFileSystemCacheForBuild: false,
    turbopackFileSystemCacheForDev: false,
  },
  // Security headers on every response.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
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
