import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Old Vite app, kept as reference during the rebuild.
    "legacy/**",
  ]),
  // Data Access Layer: only src/server may touch the DB or the raw auth API, so
  // every read and mutation goes through its session + membership checks.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/server/**", "src/db/**", "src/lib/auth.ts", "src/app/api/auth/**"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [
          { name: "@/lib/auth", message: "Use src/server (getSessionUser/requireUser) instead." },
        ],
        patterns: [
          { group: ["@/db", "@/db/*"], message: "Query the DB from src/server only." },
        ],
      }],
    },
  },
]);

export default eslintConfig;
