#!/usr/bin/env bash
# Restore the fork's HeroUI + GSAP liquid-glass UI layer from a known-good ref.
# Usage:
#   scripts/restore-ui-layer.sh                 # default: last known UI ref
#   scripts/restore-ui-layer.sh <git-ref>
# After a large upstream merge, run this then re-apply any intentional UI diffs.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

UI_REF="${1:-43c07d2}"
echo "[restore-ui-layer] restoring UI from $UI_REF"

git checkout "$UI_REF" -- \
  src/app/layout.js \
  src/app/globals.css \
  src/app/login/ \
  src/i18n/RuntimeI18nProvider.js \
  src/shared/lib/gsapClient.js \
  src/shared/hooks/useGsapPress.js \
  src/shared/hooks/useReveal.js \
  src/shared/utils/motion.js \
  src/styles/tokens/ \
  src/shared/components/ \
  src/app/\(dashboard\)/dashboard/OverviewPageClient.js \
  src/app/\(dashboard\)/dashboard/profile/page.js \
  src/app/\(dashboard\)/dashboard/providers/page.js \
  src/app/\(dashboard\)/dashboard/providers/\[id\]/page.js \
  src/app/\(dashboard\)/dashboard/providers/\[id\]/ModelRow.js \
  src/app/\(dashboard\)/dashboard/providers/components/ModelsManagerPanel.js \
  src/app/\(dashboard\)/dashboard/usage/components/RequestDetailsTab.js \
  src/app/\(dashboard\)/dashboard/usage/components/request-detail/ \
  src/app/\(dashboard\)/dashboard/endpoint/EndpointPageClient.js

# Ensure UI deps exist without rewriting whole package.json
node --input-type=module <<'EOF'
import fs from "fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.dependencies = pkg.dependencies || {};
Object.assign(pkg.dependencies, {
  "@heroui/react": pkg.dependencies["@heroui/react"] || "^3.1.0",
  "@heroui/styles": pkg.dependencies["@heroui/styles"] || "^3.1.0",
  gsap: pkg.dependencies.gsap || "^3.15.0",
  "@gsap/react": pkg.dependencies["@gsap/react"] || "^2.1.2",
});
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log("[restore-ui-layer] package.json UI deps ensured");
EOF

echo "[restore-ui-layer] done. Run: npm install && npm run build"
echo "[restore-ui-layer] tip: git config merge.ours.driver true  # for .gitattributes merge=ours"
