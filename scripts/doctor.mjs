#!/usr/bin/env node
// node scripts/doctor.mjs: check this computer is ready, before anything is installed.
//
// Run it right after cloning. It uses only what ships with Node: no packages, no network.
// It checks Node, pnpm, git, node_modules, Claude Code and whether .env.local exists, prints
// one line per check, says how to fix each problem, and ends with the next step.
// It never opens .env.local; it only looks at whether the file is there.
//
// IMPORTANT: this file must also run on OLD versions of Node, so it can say "your Node is too
// old" instead of crashing. Keep the syntax plain: no `node:` import prefix, no top-level
// await, no `?.` or `??`, no newer APIs. (Node 12.17 is the oldest that can load a .mjs file.)
//
// `pnpm run doctor` runs this file too. Plain `pnpm doctor` does not: that is pnpm's own
// built-in command, which checks pnpm's configuration instead.

// biome-ignore lint/style/useNodejsImportProtocol: "node:" imports fail on the old Node versions this script must still run on
import { spawnSync } from "child_process";
// biome-ignore lint/style/useNodejsImportProtocol: see above
import { existsSync } from "fs";
// biome-ignore lint/style/useNodejsImportProtocol: see above
import { dirname, join } from "path";
// biome-ignore lint/style/useNodejsImportProtocol: see above
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NODE_MAJOR = 22;
const NODE_MINOR = 6;

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
function paint(code, text) {
  return useColor ? `\x1b[${code}m${text}\x1b[0m` : text;
}
const MARKS = {
  ok: paint(32, "✓"),
  fail: paint(31, "✗"),
  warn: paint(33, "!"),
};

/** Runs `<command> --version`. Returns the first line it prints, or null if it is not installed. */
function versionOf(command) {
  // shell: true so Windows finds .cmd shims (pnpm.cmd, claude.cmd) the same way a terminal does.
  const result = spawnSync(`${command} --version`, {
    shell: true,
    encoding: "utf8",
    timeout: 20000,
    windowsHide: true,
  });
  if (result.error || result.status !== 0) return null;
  const line = String(result.stdout || "")
    .split(/\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean)[0];
  return line || "installed";
}

const checks = [];
function add(status, label, fix) {
  checks.push({ status, label, fix: fix || [] });
}

// ---------- Node ----------
const nodeVersion = process.versions.node;
const nodeParts = nodeVersion.split(".").map(Number);
const nodeOk =
  nodeParts[0] > NODE_MAJOR ||
  (nodeParts[0] === NODE_MAJOR && nodeParts[1] >= NODE_MINOR);
if (nodeOk) {
  add("ok", `Node.js ${nodeVersion}`);
} else {
  add(
    "fail",
    `Node.js ${nodeVersion} is too old. This project needs ${NODE_MAJOR}.${NODE_MINOR} or newer.`,
    [
      "Download the LTS version from https://nodejs.org and install it.",
      "Then close this terminal, open a new one, and run this check again.",
    ],
  );
}

// ---------- pnpm ----------
const pnpmVersion = versionOf("pnpm");
if (pnpmVersion) {
  add("ok", `pnpm ${pnpmVersion}`);
} else {
  add("fail", "pnpm is not installed.", [
    "Run: npm install -g pnpm",
    "Other ways to install it: https://pnpm.io/installation",
    "Then close this terminal, open a new one, and run this check again.",
  ]);
}

// ---------- git ----------
const gitVersion = versionOf("git");
if (gitVersion) {
  add("ok", gitVersion.replace(/^git version /, "git "));
} else {
  add("fail", "git is not installed.", [
    "Download it from https://git-scm.com/downloads and install it.",
    "Then close this terminal, open a new one, and run this check again.",
  ]);
}

// ---------- node_modules ----------
const hasModules = existsSync(join(ROOT, "node_modules"));
if (hasModules) {
  add("ok", "Packages are installed (node_modules exists)");
} else {
  add("warn", "Packages are not installed yet (no node_modules folder).", [
    "Run: pnpm install",
  ]);
}

// ---------- Claude Code (optional) ----------
const claudeVersion = versionOf("claude");
if (claudeVersion) {
  add("ok", `Claude Code ${claudeVersion}`);
} else {
  add("warn", "Claude Code is not installed. It is optional.", [
    "It gives you the /start, /design and /setup helpers.",
    "Install it from https://claude.com/claude-code",
    "Without it, use pnpm start-project instead.",
  ]);
}

// ---------- .env.local (existence only; never read) ----------
if (existsSync(join(ROOT, ".env.local"))) {
  add("ok", ".env.local exists (this check does not open it)");
} else {
  add(
    "ok",
    "No .env.local yet. That is fine: you only need it to connect accounts.",
  );
}

// ---------- report ----------
console.log("");
console.log("Checking your setup");
console.log("");
for (const check of checks) {
  console.log(`  ${MARKS[check.status]} ${check.label}`);
  for (const line of check.fix) console.log(`      ${line}`);
}
console.log("");

const failed = checks.filter((check) => check.status === "fail").length;
if (failed) {
  console.log(
    `${failed} thing${failed === 1 ? "" : "s"} to fix (marked ✗ above). Fix ${failed === 1 ? "it" : "them"}, then run this again:`,
  );
  console.log("  node scripts/doctor.mjs");
  process.exitCode = 1;
} else if (!hasModules) {
  console.log("Next step. Run:");
  console.log("  pnpm install");
  console.log(
    "After that: run pnpm start-project, or open Claude Code in this folder and type /start",
  );
} else {
  console.log("You are ready. Next step, pick one:");
  if (claudeVersion) {
    console.log(
      "  Open Claude Code in this folder (type: claude) and type /start",
    );
    console.log("  or run: pnpm start-project");
  } else {
    console.log("  Run: pnpm start-project");
    console.log(
      "  or install Claude Code, open it in this folder and type /start",
    );
  }
}
console.log("");
