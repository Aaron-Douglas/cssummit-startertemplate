#!/usr/bin/env node
// pnpm kit list               show available and installed kits
// pnpm kit add <name...>      add one or more kits (files, dependencies, env vars, nav links)
// pnpm kit add --all          add every kit in kits/ (used by `pnpm build:demo`)
//   --force                   overwrite files that already exist
//   --skip-install            do not run `pnpm add` (add the dependencies yourself later)
// The kit contract is documented in kits/README.md.

import {
  addKits,
  availableKitNames,
  KitError,
  readInstalled,
  readKit,
} from "./lib/kits.mjs";

const bold = (s) => `\x1b[1m${s}\x1b[22m`;
const dim = (s) => `\x1b[2m${s}\x1b[22m`;
const green = (s) => `\x1b[32m${s}\x1b[39m`;
const red = (s) => `\x1b[31m${s}\x1b[39m`;

function usage() {
  console.log(`Usage:
  pnpm kit list
  pnpm kit add <name...> [--force] [--skip-install]
  pnpm kit add --all [--force] [--skip-install]

Kits are optional features that live in kits/ until you add them. One or two is plenty.`);
}

function list() {
  const installed = new Set(readInstalled().installed.map((kit) => kit.name));
  const names = availableKitNames();
  if (!names.length && !installed.size) {
    console.log("No kits found in kits/.");
    return;
  }
  console.log(bold("Kits"));
  const width = Math.max(...names.map((name) => name.length), 8);
  for (const name of names) {
    let line;
    try {
      const kit = readKit(name);
      line = `${kit.title}: ${kit.description}`;
    } catch (error) {
      line = red(error.message);
    }
    const mark = installed.has(name) ? green("installed") : dim("available");
    console.log(`  ${name.padEnd(width)}  ${mark}  ${line}`);
  }
  for (const name of installed) {
    if (!names.includes(name)) {
      console.log(
        `  ${name.padEnd(width)}  ${green("installed")}  ${dim("(kit folder deleted)")}`,
      );
    }
  }
  console.log(dim("\nAdd one with: pnpm kit add <name>"));
}

function add(args) {
  const force = args.includes("--force");
  const install = !args.includes("--skip-install");
  const all = args.includes("--all");
  const unknown = args.filter(
    (arg) =>
      arg.startsWith("--") &&
      !["--force", "--skip-install", "--all"].includes(arg),
  );
  if (unknown.length) {
    throw new KitError(`Unknown option: ${unknown.join(", ")}`);
  }
  const names = all
    ? availableKitNames()
    : args.filter((arg) => !arg.startsWith("--"));
  if (all && !names.length) {
    throw new KitError("No kits found in kits/.");
  }
  const results = addKits(names, {
    force,
    install,
    log: (m) => console.log(dim(`> ${m}`)),
  });
  for (const { kit, copied, skipped, env, alreadyInstalled } of results) {
    if (alreadyInstalled) {
      console.log(
        `
${dim("•")} ${bold(kit.title)} ${dim(`(${kit.name})`)} is already installed. Nothing changed (use --force to reinstall it).`,
      );
      continue;
    }
    console.log(
      `\n${green("✔")} ${bold(`${kit.title} kit added`)} ${dim(`(${kit.name})`)}`,
    );
    if (copied.length) console.log(`  Files: ${copied.join(", ")}`);
    if (skipped.length)
      console.log(dim(`  Already identical: ${skipped.join(", ")}`));
    if (env.length)
      console.log(
        `  Env vars added to .env.example: ${env.join(", ")} (copy them into .env.local)`,
      );
    if (kit.nav.length)
      console.log(
        `  Nav: ${kit.nav.map((link) => `${link.label} → ${link.href}`).join(", ")}`,
      );
    if (
      !install &&
      (Object.keys(kit.dependencies).length ||
        Object.keys(kit.devDependencies).length)
    ) {
      console.log(
        `  Skipped installing: ${Object.keys({ ...kit.dependencies, ...kit.devDependencies }).join(", ")}`,
      );
    }
    if (kit.next) console.log(`  ${bold("Next:")} ${kit.next}`);
  }
  console.log(
    dim("\nRun pnpm dev to see it, and pnpm verify before you deploy."),
  );
}

const [command, ...rest] = process.argv.slice(2);
try {
  if (command === "list" || command === "ls") list();
  else if (command === "add") add(rest);
  else {
    usage();
    if (command && command !== "help" && command !== "--help")
      process.exitCode = 1;
  }
} catch (error) {
  if (error instanceof KitError) {
    console.error(red(`✖ ${error.message}`));
    process.exitCode = 1;
  } else throw error;
}
