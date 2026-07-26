import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2];

if (mode !== "original" && mode !== "public") {
  throw new Error(
    'Neural asset mode must be exactly "original" or "public". ' +
      "Use `npm run asset:original` or `npm run asset:public`.",
  );
}

const manifest = JSON.parse(
  await readFile(join(root, "assets", "neural-assets.json"), "utf8"),
);
const destination = join(root, "public", "neural-reference.png");

let source;
if (mode === "original") {
  source = join(root, ".local-assets", "neural-reference-original-4k.png");
  try {
    await readFile(source);
  } catch {
    throw new Error(
      "The local 4K microscopy master is unavailable. Restore it at " +
        "`.local-assets/neural-reference-original-4k.png` before running original mode. " +
        "Use `npm run dev:public` when only committed assets are available.",
    );
  }
} else {
  source = join(root, "assets", "neural-reference-public.png");
}

const sourceBytes = await readFile(source);
const sourceHash = createHash("sha256").update(sourceBytes).digest("hex");
const expectedHash = manifest[mode].sha256;

if (sourceHash !== expectedHash) {
  throw new Error(
    `The ${mode} neural asset hash does not match assets/neural-assets.json.`,
  );
}

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);

const copiedHash = createHash("sha256")
  .update(await readFile(destination))
  .digest("hex");

if (copiedHash !== expectedHash) {
  throw new Error(`Failed to copy the ${mode} neural asset without mutation.`);
}

console.log(`Selected neural profile: ${mode}`);
