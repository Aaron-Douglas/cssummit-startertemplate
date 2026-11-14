#!/usr/bin/env node
// pnpm start-project: the first-run wizard.
//   1. project name   → lib/site.ts (site.name) and package.json (name)
//   2. kits           → pnpm kit add ...
//   3. design         → design.config.ts (a preset, or Shuffle)
//   4. tidy up        → offer to delete the kits/ folders you did not pick
//
// Non-interactive (for scripts and agents):
//   pnpm start-project --name "Study Buddy" --kits chatbot,learning --design soft --yes
//   --design accepts a preset name or "shuffle". --kits none adds no kit.
//   --prune deletes unused kit folders (never done without --prune or a "yes" in the wizard).
//   --skip-install skips `pnpm add` for kit dependencies.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  addKits,
  availableKitNames,
  KITS_DIR,
  KitError,
  ROOT,
  readInstalled,
  readKit,
} from "./lib/kits.mjs";

// lib/design.ts is the single source of truth for presets. Node 22.18+ runs TypeScript
// directly; older Node 22 releases need the flag, so re-run ourselves with it once.
let design;
try {
  design = await import(pathToFileURL(join(ROOT, "lib", "design.ts")).href);
} catch (error) {
  if (!process.execArgv.includes("--experimental-strip-types")) {
    const result = spawnSync(
      process.execPath,
      ["--experimental-strip-types", "--no-warnings", ...process.argv.slice(1)],
      { stdio: "inherit" },
    );
    process.exit(result.status ?? 1);
  }
  console.error(
    `Could not load lib/design.ts (${error.message}).\nThis script needs Node 22.6 or newer: node --version`,
  );
  process.exit(1);
}

const clack = await import("@clack/prompts");

// ---------- args ----------
function parseArgs(argv) {
  const args = { yes: false, prune: false, install: true };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const [key, inline] = arg.split(/=(.*)/s, 2);
    const value = () => (inline !== undefined ? inline : argv[++i]);
    if (key === "--name") args.name = value();
    else if (key === "--kits") args.kits = value();
    else if (key === "--design") args.design = value();
    else if (key === "--yes" || key === "-y") args.yes = true;
    else if (key === "--prune") args.prune = true;
    else if (key === "--skip-install") args.install = false;
    else if (key === "--help" || key === "-h") args.help = true;
    else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(
    'Usage: pnpm start-project [--name "My Project"] [--kits a,b|none] [--design <preset>|shuffle] [--yes] [--prune] [--skip-install]',
  );
  process.exit(0);
}
const interactive = !args.yes && process.stdin.isTTY;

// ---------- helpers ----------
const SITE_FILE = join(ROOT, "lib", "site.ts");
const PACKAGE_FILE = join(ROOT, "package.json");
const DESIGN_FILE = join(ROOT, "design.config.ts");

function currentName() {
  const match = readFileSync(SITE_FILE, "utf8").match(
    /^\s*name:\s*"([^"]*)",/m,
  );
  return match ? match[1] : "My Project";
}

function slugify(name) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 214) || "my-project"
  );
}

function setName(name) {
  const safe = name.replace(/\\/g, "").replace(/"/g, "'").trim();
  const site = readFileSync(SITE_FILE, "utf8");
  const updated = site.replace(
    /^(\s*name:\s*)"[^"]*",/m,
    `$1${JSON.stringify(safe)},`,
  );
  if (updated === site && !site.includes(JSON.stringify(safe))) {
    throw new Error(
      'Could not find `name: "..."` in lib/site.ts. Edit it by hand.',
    );
  }
  writeFileSync(SITE_FILE, updated);
  const pkg = JSON.parse(readFileSync(PACKAGE_FILE, "utf8"));
  pkg.name = slugify(safe);
  writeFileSync(PACKAGE_FILE, `${JSON.stringify(pkg, null, 2)}\n`);
}

function writeDesign(choice) {
  const resolved =
    choice === "shuffle"
      ? design.shuffleDesign()
      : design.resolveDesign({ preset: choice });
  writeFileSync(DESIGN_FILE, design.designConfigSource(resolved));
  return resolved;
}

function cancelled(value) {
  if (clack.isCancel(value)) {
    clack.cancel("Stopped. Nothing else was changed.");
    process.exit(0);
  }
  return value;
}

// ---------- gather answers ----------
const kitNames = availableKitNames();
const installedNames = new Set(
  readInstalled().installed.map((kit) => kit.name),
);
const kitInfo = kitNames.map((name) => {
  try {
    return readKit(name);
  } catch {
    return { name, title: name, description: "(kit.json has a problem)" };
  }
});

if (interactive) clack.intro("Start a project");

let name = args.name;
if (!name && interactive) {
  name = cancelled(
    await clack.text({
      message: "What's your project called?",
      placeholder: currentName(),
      defaultValue: currentName(),
      validate: (value) =>
        value && value.trim().length > 60
          ? "Keep it under 60 characters."
          : undefined,
    }),
  );
}

let kits = [];
if (args.kits !== undefined) {
  kits =
    args.kits === "none"
      ? []
      : args.kits
          .split(",")
          .map((kit) => kit.trim())
          .filter(Boolean);
} else if (interactive && kitInfo.length) {
  kits = cancelled(
    await clack.multiselect({
      message:
        "What are you building? Pick a kit or two (space to select, enter to confirm).",
      options: kitInfo.map((kit) => ({
        value: kit.name,
        label: kit.title,
        hint: installedNames.has(kit.name) ? "installed" : kit.description,
      })),
      required: false,
    }),
  );
  if (kits.length > 2) {
    clack.log.warn(
      "That's a lot for one weekend. One or two kits is plenty; you can add more later.",
    );
  }
}

let designChoice = args.design;
if (
  designChoice !== undefined &&
  designChoice !== "shuffle" &&
  !design.isPresetName(designChoice)
) {
  console.error(
    `Unknown design "${designChoice}". Use one of: ${design.PRESET_NAMES.join(", ")}, shuffle.`,
  );
  process.exit(1);
}
if (designChoice === undefined && interactive) {
  designChoice = cancelled(
    await clack.select({
      message:
        "Pick a look (you can change it any time with the Design button in pnpm dev)",
      options: [
        ...design.PRESET_NAMES.map((preset) => ({
          value: preset,
          label: preset,
          hint: Object.values(design.PRESETS[preset]).join(" · "),
        })),
        {
          value: "shuffle",
          label: "Shuffle",
          hint: "a random mix nobody else has",
        },
        { value: "keep", label: "Keep the current design" },
      ],
    }),
  );
}
if (designChoice === "keep") designChoice = undefined;

// ---------- apply ----------
const done = [];
try {
  if (name?.trim()) {
    setName(name.trim());
    done.push(`Name: ${name.trim()} (lib/site.ts, package.json)`);
  }

  const toAdd = kits.filter((kit) => !installedNames.has(kit));
  if (toAdd.length) {
    if (interactive) clack.log.step(`Adding kits: ${toAdd.join(", ")}`);
    const results = addKits(toAdd, {
      install: args.install,
      log: (message) => console.log(`> ${message}`),
    });
    for (const { kit, env } of results) {
      done.push(
        `Kit: ${kit.title}${env.length ? ` (env vars: ${env.join(", ")})` : ""}`,
      );
      if (kit.next) done.push(`  Next: ${kit.next}`);
    }
  }

  if (designChoice) {
    const resolved = writeDesign(designChoice);
    done.push(
      `Design: ${designChoice === "shuffle" ? "shuffled" : designChoice} (${Object.values(resolved).join(", ")})`,
    );
  }
} catch (error) {
  const message =
    error instanceof KitError ? error.message : String(error?.stack ?? error);
  if (interactive) clack.log.error(message);
  else console.error(message);
  process.exit(1);
}

// ---------- tidy up ----------
const keep = new Set([...installedNames, ...kits]);
const unused = availableKitNames().filter((kit) => !keep.has(kit));
if (unused.length && existsSync(KITS_DIR)) {
  let prune = args.prune;
  if (!prune && interactive) {
    prune = cancelled(
      await clack.confirm({
        message: `Delete the ${unused.length} kit folders you didn't pick (${unused.join(", ")})? Keeps the repo small; you can't add them later without re-downloading the template.`,
        initialValue: false,
      }),
    );
  }
  if (prune) {
    for (const kit of unused)
      rmSync(join(KITS_DIR, kit), { recursive: true, force: true });
    done.push(`Deleted unused kits: ${unused.join(", ")}`);
  }
}

const summary = done.length ? done.join("\n") : "Nothing changed.";
if (interactive) {
  clack.note(summary, "Done");
  clack.outro("Next: pnpm dev, then open http://localhost:3000");
} else {
  console.log(`${summary}\nNext: pnpm dev, then open http://localhost:3000`);
}
