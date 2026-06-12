import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "www");

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });

for (const entry of ["index.html", "manifest.webmanifest", "sw.js", "_headers", "_redirects", "css", "icons", "js"]) {
  await cp(join(root, entry), join(output, entry), { recursive: true });
}

console.log("Built static app into www/");
