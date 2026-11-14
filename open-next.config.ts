// OpenNext adapter config for Cloudflare Workers (`pnpm cf:build`). Vercel ignores this file.
// See https://opennext.js.org/cloudflare/caching
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  // Pages prerendered by `next build` are served from the worker's static assets: nothing to
  // create on your Cloudflare account. This cache is read-only, so time-based revalidation
  // (ISR) is off; switch to the R2 cache if you ever need it.
  incrementalCache: staticAssetsIncrementalCache,
});
