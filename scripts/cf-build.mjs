#!/usr/bin/env node
// pnpm cf:build        build the app for Cloudflare Workers with OpenNext (into .open-next/)
// pnpm cf:build:demo   the public demo: adds every kit and turns the design switcher on first
//                      (the Cloudflare counterpart of `pnpm build:demo`; not for teams)
//
// Sets BUILD_TARGET=cloudflare, which next.config.ts reads (see the note there). Plain Node so
// the env vars work the same on Windows, macOS and Linux.

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const demo = process.argv.includes("--demo");

function run(command, args, { env = process.env, shell = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    stdio: "inherit",
    shell,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const env = { ...process.env, BUILD_TARGET: "cloudflare" };
if (demo) {
  run(process.execPath, ["scripts/kit.mjs", "add", "--all"]);
  env.NEXT_PUBLIC_DESIGN_SWITCHER ||= "true";
}
run("pnpm", ["exec", "opennextjs-cloudflare", "build"], {
  env,
  // pnpm is a .cmd shim on Windows, which needs a shell.
  shell: process.platform === "win32",
});
