import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");

if (!fs.existsSync(path.join(standalone, "server.js"))) {
  console.warn("[postbuild] No standalone output — skipping prepare-standalone");
  process.exit(0);
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dest, { recursive: true });
}

copyIfExists(path.join(root, "public"), path.join(standalone, "public"));
copyIfExists(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"));
copyIfExists(path.join(root, "custom-server.js"), path.join(standalone, "custom-server.js"));

const envSrc = path.join(root, ".env");
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, path.join(standalone, ".env"));
}

console.log("[postbuild] Standalone bundle prepared");