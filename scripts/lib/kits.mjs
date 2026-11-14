// Shared logic for `pnpm kit` and `pnpm start-project`. Plain Node (no dependencies) so it runs
// before anything is built. The kit contract is documented in kits/README.md.

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const KITS_DIR = join(ROOT, "kits");
export const INSTALLED_FILE = join(ROOT, "kits.installed.json");
export const ENV_EXAMPLE = join(ROOT, ".env.example");

const NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export class KitError extends Error {}

/** Every kit folder in kits/ that has a kit.json. */
export function availableKitNames() {
  if (!existsSync(KITS_DIR)) return [];
  return readdirSync(KITS_DIR, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(join(KITS_DIR, entry.name, "kit.json")),
    )
    .map((entry) => entry.name)
    .sort();
}

/** Read and validate kits/<name>/kit.json. */
export function readKit(name) {
  if (!NAME_PATTERN.test(name)) {
    throw new KitError(`"${name}" is not a valid kit name.`);
  }
  const manifestPath = join(KITS_DIR, name, "kit.json");
  if (!existsSync(manifestPath)) {
    const available = availableKitNames();
    throw new KitError(
      `No kit called "${name}". Available: ${available.length ? available.join(", ") : "none (the kits/ folder is empty or was deleted)"}.`,
    );
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new KitError(
      `kits/${name}/kit.json is not valid JSON: ${error.message}`,
    );
  }
  const problems = [];
  if (manifest.name !== name) problems.push(`"name" must be "${name}"`);
  if (typeof manifest.title !== "string")
    problems.push(`"title" must be a string`);
  if (typeof manifest.description !== "string")
    problems.push(`"description" must be a string`);
  for (const key of ["dependencies", "devDependencies"]) {
    const value = manifest[key] ?? {};
    if (typeof value !== "object" || Array.isArray(value))
      problems.push(`"${key}" must be an object of { package: version }`);
  }
  if (!Array.isArray(manifest.env ?? []))
    problems.push(`"env" must be an array`);
  for (const variable of manifest.env ?? []) {
    if (!variable || typeof variable.name !== "string")
      problems.push(`every "env" entry needs a "name"`);
  }
  if (!Array.isArray(manifest.nav ?? []))
    problems.push(`"nav" must be an array`);
  for (const link of manifest.nav ?? []) {
    if (
      !link ||
      typeof link.label !== "string" ||
      typeof link.href !== "string"
    )
      problems.push(`every "nav" entry needs "label" and "href"`);
  }
  if (problems.length) {
    throw new KitError(`kits/${name}/kit.json: ${problems.join("; ")}.`);
  }
  return {
    name,
    title: manifest.title,
    description: manifest.description,
    dependencies: manifest.dependencies ?? {},
    devDependencies: manifest.devDependencies ?? {},
    env: manifest.env ?? [],
    nav: manifest.nav ?? [],
    next: typeof manifest.next === "string" ? manifest.next : "",
    filesDir: join(KITS_DIR, name, "files"),
  };
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

/** [{ from, to, rel }] for every file a kit would copy into the project. */
export function kitFiles(kit) {
  return walk(kit.filesDir).map((from) => {
    const rel = relative(kit.filesDir, from).split(sep).join("/");
    return { from, to: join(ROOT, rel), rel };
  });
}

export function readInstalled() {
  if (!existsSync(INSTALLED_FILE)) return { installed: [] };
  try {
    const data = JSON.parse(readFileSync(INSTALLED_FILE, "utf8"));
    return { installed: Array.isArray(data.installed) ? data.installed : [] };
  } catch {
    return { installed: [] };
  }
}

function writeInstalled(data) {
  writeFileSync(INSTALLED_FILE, `${JSON.stringify(data, null, 2)}\n`);
}

function sameContent(a, b) {
  const sa = statSync(a);
  const sb = statSync(b);
  if (sa.size !== sb.size) return false;
  return readFileSync(a).equals(readFileSync(b));
}

/** Appends a kit's env vars that are not in .env.example yet. Returns the names added. */
function appendEnv(kit) {
  if (!kit.env.length) return [];
  const current = existsSync(ENV_EXAMPLE)
    ? readFileSync(ENV_EXAMPLE, "utf8")
    : "";
  const present = new Set(
    current
      .split(/\r?\n/)
      .map(
        (line) =>
          line.replace(/^#\s*/, "").match(/^([A-Za-z_][A-Za-z0-9_]*)=/)?.[1],
      )
      .filter(Boolean),
  );
  const missing = kit.env.filter((variable) => !present.has(variable.name));
  if (!missing.length) return [];
  const lines = [`# --- ${kit.title} kit (${kit.name}) ---`];
  for (const variable of missing) {
    if (variable.comment) {
      for (const line of String(variable.comment).split("\n"))
        lines.push(`# ${line}`);
    }
    lines.push(`${variable.name}=${variable.example ?? ""}`);
  }
  const prefix = current === "" ? "" : current.endsWith("\n") ? "\n" : "\n\n";
  writeFileSync(ENV_EXAMPLE, `${current}${prefix}${lines.join("\n")}\n`);
  return missing.map((variable) => variable.name);
}

function pnpmAdd(packages, dev, log) {
  const specs = Object.entries(packages).map(([pkg, version]) =>
    version && version !== "*" && version !== "latest"
      ? `${pkg}@${version}`
      : pkg,
  );
  if (!specs.length) return;
  const args = ["add", ...(dev ? ["-D"] : []), ...specs];
  log(`pnpm ${args.join(" ")}`);
  const result = spawnSync("pnpm", args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    throw new KitError(
      `"pnpm ${args.join(" ")}" failed. Fix the error above, then run the same command yourself.`,
    );
  }
}

/** Format copied files with the project's Biome config so `pnpm verify` stays green. */
function formatFiles(rels) {
  const targets = rels.filter((rel) =>
    /\.(?:[cm]?[jt]sx?|json|css)$/.test(rel),
  );
  if (!targets.length) return;
  spawnSync(
    "pnpm",
    [
      "exec",
      "biome",
      "check",
      "--write",
      "--no-errors-on-unmatched",
      ...targets,
    ],
    { cwd: ROOT, stdio: "ignore", shell: process.platform === "win32" },
  );
}

/**
 * Install kits. Checks every kit and every file first and changes nothing if there is a
 * conflict (an existing file with different content) unless `force` is set.
 * Returns [{ kit, copied, skipped, env }].
 */
export function addKits(
  names,
  { force = false, install = true, log = console.log } = {},
) {
  const unique = [...new Set(names)];
  if (!unique.length)
    throw new KitError("Name at least one kit. Try: pnpm kit list");
  const installed = readInstalled();
  const isInstalled = (name) =>
    installed.installed.some((item) => item.name === name);
  const requested = unique.map(readKit);
  // An installed kit is skipped (its files may have been edited since); --force reinstalls.
  const alreadyInstalled = force
    ? []
    : requested.filter((kit) => isInstalled(kit.name));
  const kits = requested.filter((kit) => !alreadyInstalled.includes(kit));
  if (!kits.length) {
    return alreadyInstalled.map((kit) => ({
      kit,
      alreadyInstalled: true,
      copied: [],
      skipped: [],
      env: [],
    }));
  }

  // 1. Plan and check for conflicts before touching anything.
  const plans = kits.map((kit) => {
    const files = kitFiles(kit);
    const conflicts = [];
    const skipped = [];
    const copy = [];
    for (const file of files) {
      if (existsSync(file.to)) {
        if (sameContent(file.from, file.to)) skipped.push(file);
        else conflicts.push(file);
      } else copy.push(file);
    }
    return { kit, conflicts, skipped, copy };
  });
  const targets = new Map();
  for (const plan of plans) {
    for (const file of [...plan.copy, ...plan.conflicts]) {
      const other = targets.get(file.rel);
      if (other && other !== plan.kit.name) {
        throw new KitError(
          `Kits "${other}" and "${plan.kit.name}" both write ${file.rel}. Add them one at a time.`,
        );
      }
      targets.set(file.rel, plan.kit.name);
    }
  }
  const allConflicts = plans.flatMap((plan) =>
    plan.conflicts.map((file) => `${plan.kit.name}: ${file.rel}`),
  );
  if (allConflicts.length && !force) {
    throw new KitError(
      `These files already exist and differ from the kit's version:\n  ${allConflicts.join("\n  ")}\nNothing was changed. Move or rename your files, or re-run with --force to overwrite them.`,
    );
  }

  // 2. Copy files.
  const results = [];
  for (const plan of plans) {
    const written = [...plan.copy, ...(force ? plan.conflicts : [])];
    for (const file of written) {
      mkdirSync(dirname(file.to), { recursive: true });
      copyFileSync(file.from, file.to);
    }
    results.push({
      kit: plan.kit,
      copied: written.map((f) => f.rel),
      skipped: plan.skipped.map((f) => f.rel),
    });
  }
  formatFiles(results.flatMap((result) => result.copied));

  // 3. Dependencies (one pnpm call for all kits).
  if (install) {
    const deps = Object.assign({}, ...kits.map((kit) => kit.dependencies));
    const devDeps = Object.assign(
      {},
      ...kits.map((kit) => kit.devDependencies),
    );
    pnpmAdd(deps, false, log);
    pnpmAdd(devDeps, true, log);
  }

  // 4. .env.example and kits.installed.json.
  for (const result of results) {
    result.env = appendEnv(result.kit);
    const entry = { name: result.kit.name, nav: result.kit.nav };
    const index = installed.installed.findIndex(
      (item) => item.name === result.kit.name,
    );
    if (index === -1) installed.installed.push(entry);
    else installed.installed[index] = entry;
  }
  writeInstalled(installed);
  return [
    ...alreadyInstalled.map((kit) => ({
      kit,
      alreadyInstalled: true,
      copied: [],
      skipped: [],
      env: [],
    })),
    ...results,
  ];
}
