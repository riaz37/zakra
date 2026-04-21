#!/usr/bin/env tsx
/**
 * CI guard: verifies every `var(--x)` reference in src/ resolves against a
 * CSS variable defined in src/app/globals.css, and flags orphan Tailwind-like
 * class names (e.g. `font-mono-zakra`) that correspond to no utility.
 *
 * Exits 1 on any undefined var ref or orphan class; 0 otherwise.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

type Finding = {
  readonly file: string;
  readonly line: number;
  readonly name: string;
};

type ScanResult = {
  readonly undefinedRefs: readonly Finding[];
  readonly orphanClasses: readonly Finding[];
};

const REPO_ROOT = resolve(__dirname, "..");
const SRC_DIR = join(REPO_ROOT, "src");
const GLOBALS_CSS = join(SRC_DIR, "app", "globals.css");

// Custom font-mono-* utilities that are explicitly defined in globals.css.
// Keep this list in lockstep with any `@layer utilities` declarations.
const ORPHAN_ALLOWLIST: ReadonlySet<string> = new Set(["font-mono-label"]);

// Directory names to skip when walking src/.
const SKIP_DIRS: ReadonlySet<string> = new Set([
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
]);

const SCAN_EXTENSIONS: ReadonlySet<string> = new Set([".ts", ".tsx", ".css"]);

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, acc);
      continue;
    }
    const dotIdx = entry.lastIndexOf(".");
    if (dotIdx === -1) continue;
    const ext = entry.slice(dotIdx);
    if (SCAN_EXTENSIONS.has(ext)) acc.push(full);
  }
  return acc;
}

function extractDefinedVars(css: string): Set<string> {
  const defined = new Set<string>();
  // Match any `--identifier:` that appears before a `;` or newline.
  // This catches declarations in :root, .dark, [data-theme="dark"], and @theme inline blocks.
  const declRe = /--([a-zA-Z0-9_-]+)\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = declRe.exec(css)) !== null) {
    defined.add(m[1]);
  }
  return defined;
}

function scanFile(
  file: string,
  defined: ReadonlySet<string>
): { undefinedRefs: Finding[]; orphanClasses: Finding[] } {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const undefinedRefs: Finding[] = [];
  const orphanClasses: Finding[] = [];

  const varRe = /var\(\s*--([a-zA-Z0-9_-]+)\s*(?:,[^)]*)?\)/g;
  const fontMonoRe = /\bfont-mono-[a-z0-9-]+\b/g;

  const isTsx = file.endsWith(".tsx");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let vm: RegExpExecArray | null;
    varRe.lastIndex = 0;
    while ((vm = varRe.exec(line)) !== null) {
      const name = vm[1];
      if (!defined.has(name)) {
        undefinedRefs.push({
          file,
          line: i + 1,
          name: `var(--${name})`,
        });
      }
    }

    if (isTsx) {
      let fm: RegExpExecArray | null;
      fontMonoRe.lastIndex = 0;
      while ((fm = fontMonoRe.exec(line)) !== null) {
        const cls = fm[0];
        if (!ORPHAN_ALLOWLIST.has(cls)) {
          orphanClasses.push({ file, line: i + 1, name: cls });
        }
      }
    }
  }

  return { undefinedRefs, orphanClasses };
}

function format(f: Finding): string {
  const rel = relative(REPO_ROOT, f.file);
  return `  ${rel}:${f.line} -> ${f.name}`;
}

function main(): void {
  const css = readFileSync(GLOBALS_CSS, "utf8");
  const defined = extractDefinedVars(css);

  const files = walk(SRC_DIR);
  const allUndefined: Finding[] = [];
  const allOrphans: Finding[] = [];

  for (const file of files) {
    const { undefinedRefs, orphanClasses } = scanFile(file, defined);
    allUndefined.push(...undefinedRefs);
    allOrphans.push(...orphanClasses);
  }

  const result: ScanResult = {
    undefinedRefs: allUndefined,
    orphanClasses: allOrphans,
  };

  if (result.undefinedRefs.length === 0 && result.orphanClasses.length === 0) {
    console.log(
      `check:tokens OK — ${defined.size} vars defined, ${files.length} files scanned.`
    );
    process.exit(0);
  }

  if (result.undefinedRefs.length > 0) {
    console.error("Undefined CSS vars referenced:");
    for (const f of result.undefinedRefs) console.error(format(f));
  }
  if (result.orphanClasses.length > 0) {
    console.error("Orphan class names:");
    for (const f of result.orphanClasses) console.error(format(f));
  }
  console.error(
    `Total: ${result.undefinedRefs.length} undefined, ${result.orphanClasses.length} orphan`
  );
  process.exit(1);
}

main();
