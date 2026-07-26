import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, join, relative, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "out");
const manifest = JSON.parse(
  await readFile(join(root, "assets", "neural-assets.json"), "utf8"),
);
const publicHash = manifest.public.sha256;
const originalHash = manifest.original.sha256;
const failures = [];

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

const runtimeAsset = join(outDir, "neural-reference.png");
try {
  if (hash(await readFile(runtimeAsset)) !== publicHash) {
    failures.push("out/neural-reference.png does not match the public fallback.");
  }
} catch {
  failures.push("out/neural-reference.png is missing.");
}

const outputFiles = await walk(outDir);
const textExtensions = new Set([
  ".html",
  ".js",
  ".css",
  ".json",
  ".map",
  ".txt",
  ".xml",
  ".webmanifest",
]);
const forbiddenReferences = [
  "neural-reference-original",
  ".local-assets",
  "codex-clipboard-32f218a7-8e4e-4c06-964c-85e7e744cbf9",
];
let publicProfileFound = false;

for (const path of outputFiles) {
  const bytes = await readFile(path);
  if (hash(bytes) === originalHash) {
    failures.push(
      `Original microscopy asset found in out/${relative(outDir, path)}.`,
    );
  }

  const name = path.toLowerCase();
  const shouldScan =
    textExtensions.has(extname(name)) || name.includes("manifest");
  if (!shouldScan) continue;

  const text = bytes.toString("utf8");
  if (text.includes(originalHash)) {
    failures.push(
      `Original asset hash found in out/${relative(outDir, path)}.`,
    );
  }
  for (const reference of forbiddenReferences) {
    if (text.includes(reference)) {
      failures.push(
        `Forbidden original-asset reference "${reference}" found in out/${relative(outDir, path)}.`,
      );
    }
  }

  if (extname(name) === ".html") {
    if (text.includes('data-neural-profile="public"')) {
      publicProfileFound = true;
    }
    if (text.includes('data-neural-profile="original"')) {
      failures.push(
        `Original anchor profile found in public HTML: out/${relative(outDir, path)}.`,
      );
    }
  }
}

if (!publicProfileFound) {
  failures.push(
    'No exported HTML contains data-neural-profile="public".',
  );
}

const trackedResult = spawnSync("git", ["ls-files", "-z"], {
  cwd: root,
  encoding: "utf8",
});
if (trackedResult.status !== 0) {
  failures.push("Unable to inspect Git-tracked files.");
} else {
  const trackedFiles = trackedResult.stdout.split("\0").filter(Boolean);
  for (const tracked of trackedFiles) {
    const normalized = tracked.split(sep).join("/");
    if (
      normalized.startsWith(".local-assets/") ||
      normalized === "public/neural-reference.png"
    ) {
      failures.push(`Git must not track ${normalized}.`);
    }

    const absolute = join(root, tracked);
    try {
      if ((await stat(absolute)).isFile()) {
        const bytes = await readFile(absolute);
        if (hash(bytes) === originalHash) {
          failures.push(`Git tracks an original-master copy at ${normalized}.`);
        }
      }
    } catch {
      // A deleted tracked file cannot contain the original asset.
    }
  }
}

if (publicHash === originalHash) {
  failures.push("The original and public neural source images are duplicates.");
}

if (failures.length > 0) {
  console.error("Public neural build assertion failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Public neural build assertion passed: public profile active, original asset absent.",
);
