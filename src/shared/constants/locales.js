import { LOCALE_NAMES } from "@/i18n/config";

/** ISO 3166-1 alpha-2 country codes mapped to /public/flags/{code}.svg */
export const LOCALE_META = {
  en: { countryCode: "us", nativeName: "English", englishName: "English" },
  vi: { countryCode: "vn", nativeName: "Tiếng Việt", englishName: "Vietnamese" },
  "zh-CN": { countryCode: "cn", nativeName: "简体中文", englishName: "Chinese (Simplified)" },
  "zh-TW": { countryCode: "tw", nativeName: "繁體中文", englishName: "Chinese (Traditional)" },
  ja: { countryCode: "jp", nativeName: "日本語", englishName: "Japanese" },
  "pt-BR": { countryCode: "br", nativeName: "Português (Brasil)", englishName: "Portuguese (Brazil)" },
  "pt-PT": { countryCode: "pt", nativeName: "Português (Portugal)", englishName: "Portuguese (Portugal)" },
  ko: { countryCode: "kr", nativeName: "한국어", englishName: "Korean" },
  es: { countryCode: "es", nativeName: "Español", englishName: "Spanish" },
  de: { countryCode: "de", nativeName: "Deutsch", englishName: "German" },
  fr: { countryCode: "fr", nativeName: "Français", englishName: "French" },
  he: { countryCode: "il", nativeName: "עברית", englishName: "Hebrew" },
  ar: { countryCode: "sa", nativeName: "العربية", englishName: "Arabic" },
  ru: { countryCode: "ru", nativeName: "Русский", englishName: "Russian" },
  pl: { countryCode: "pl", nativeName: "Polski", englishName: "Polish" },
  cs: { countryCode: "cz", nativeName: "Čeština", englishName: "Czech" },
  nl: { countryCode: "nl", nativeName: "Nederlands", englishName: "Dutch" },
  tr: { countryCode: "tr", nativeName: "Türkçe", englishName: "Turkish" },
  uk: { countryCode: "ua", nativeName: "Українська", englishName: "Ukrainian" },
  tl: { countryCode: "ph", nativeName: "Tagalog", englishName: "Tagalog" },
  id: { countryCode: "id", nativeName: "Indonesia", englishName: "Indonesian" },
  th: { countryCode: "th", nativeName: "ไทย", englishName: "Thai" },
  hi: { countryCode: "in", nativeName: "हिन्दी", englishName: "Hindi" },
  bn: { countryCode: "bd", nativeName: "বাংলা", englishName: "Bengali" },
  ur: { countryCode: "pk", nativeName: "اردو", englishName: "Urdu" },
  ro: { countryCode: "ro", nativeName: "Română", englishName: "Romanian" },
  sv: { countryCode: "se", nativeName: "Svenska", englishName: "Swedish" },
  it: { countryCode: "it", nativeName: "Italiano", englishName: "Italian" },
  el: { countryCode: "gr", nativeName: "Ελληνικά", englishName: "Greek" },
  hu: { countryCode: "hu", nativeName: "Magyar", englishName: "Hungarian" },
  fi: { countryCode: "fi", nativeName: "Suomi", englishName: "Finnish" },
  da: { countryCode: "dk", nativeName: "Dansk", englishName: "Danish" },
  no: { countryCode: "no", nativeName: "Norsk", englishName: "Norwegian" },
};

export function getLocaleMeta(locale) {
  const meta = LOCALE_META[locale];
  if (meta) return meta;
  return {
    countryCode: "gb",
    nativeName: LOCALE_NAMES[locale] || locale,
    englishName: LOCALE_NAMES[locale] || locale,
  };
}

export function getLocaleDisplayName(locale) {
  return getLocaleMeta(locale).nativeName;
}