import fs from "fs";
import path from "path";

export function loadLocaleLiterals(locale) {
  if (!locale || locale === "en") return {};
  try {
    const filePath = path.join(process.cwd(), "public/i18n/literals", `${locale}.json`);
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}