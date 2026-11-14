#!/usr/bin/env node
// PostToolUse hook: format the file Claude just edited with Biome.
// Reads the hook JSON from stdin, formats tool_input.file_path, and always
// exits 0 so a formatting problem never fails the edit.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const SOURCE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".json",
  ".jsonc",
  ".css",
]);

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(data));
  });
}

async function main() {
  const raw = await readStdin();
  let input;
  try {
    input = JSON.parse(raw.replace(/^﻿/, "").trim());
  } catch {
    return;
  }

  const filePath = input?.tool_input?.file_path;
  if (typeof filePath !== "string" || filePath.length === 0) return;

  const projectDir = path.resolve(
    process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd(),
  );
  const absolute = path.resolve(projectDir, filePath);
  const relative = path.relative(projectDir, absolute);

  // Only files inside the project.
  if (relative.startsWith("..") || path.isAbsolute(relative)) return;

  const parts = relative.split(path.sep);
  if (parts.includes("node_modules") || parts[0] === "kits") return;
  if (!SOURCE_EXTENSIONS.has(path.extname(absolute).toLowerCase())) return;
  if (!existsSync(absolute)) return;

  const args = ["format", "--write", "--no-errors-on-unmatched", relative];
  const options = {
    cwd: projectDir,
    stdio: "ignore",
    timeout: 20_000,
    windowsHide: true,
  };

  // Prefer the project's own Biome, run through the current Node binary
  // (works the same on Windows, macOS and Linux, no shell needed).
  const localBiome = path.join(
    projectDir,
    "node_modules",
    "@biomejs",
    "biome",
    "bin",
    "biome",
  );
  if (existsSync(localBiome)) {
    spawnSync(process.execPath, [localBiome, ...args], options);
    return;
  }

  // Fallback: pnpm exec biome. On Windows pnpm is a .cmd shim, which needs a shell.
  const isWindows = process.platform === "win32";
  spawnSync(
    "pnpm",
    ["exec", "biome", ...args].map((a) => (isWindows ? `"${a}"` : a)),
    { ...options, shell: isWindows },
  );
}

main()
  .catch(() => {})
  .finally(() => process.exit(0));
