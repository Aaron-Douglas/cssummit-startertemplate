import type { NextConfig } from "next";

// `pnpm cf:build` (Cloudflare Workers, via OpenNext) sets BUILD_TARGET=cloudflare. OpenNext
// cannot yet resume Cache Components' partial prerenders on Workers: pages with a <Suspense>
// hole would hang or show only their loading state. So that build turns Cache Components off;
// those pages are then rendered on each request (still streamed) and fully static pages stay
// static. Every other build (`pnpm dev`, `pnpm build`, Vercel) keeps it on.
const cacheComponents = process.env.BUILD_TARGET !== "cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents,
  partialPrefetching: cacheComponents,
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
