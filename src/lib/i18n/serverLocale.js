import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale, isSupportedLocale } from "@/i18n/config";
import { getSettings, updateSettings } from "@/lib/localDb";

export const SYSTEM_DEFAULT_LOCALE = "vi";

export async function resolveServerLocale() {
  try {
    const settings = await getSettings();
    const stored = settings?.uiLocale;
    if (stored && isSupportedLocale(stored)) {
      return normalizeLocale(stored);
    }
    // Persist system default on first access so locale never falls back to English
    try {
      await persistUiLocale(SYSTEM_DEFAULT_LOCALE);
    } catch {
      // ignore persist errors during read path
    }
    return SYSTEM_DEFAULT_LOCALE;
  } catch {
    // fall through to cookie/default
  }

  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
    if (cookieLocale && isSupportedLocale(cookieLocale)) {
      return normalizeLocale(cookieLocale);
    }
  } catch {
    // ignore during static generation edge cases
  }

  return SYSTEM_DEFAULT_LOCALE;
}

export async function persistUiLocale(locale) {
  const normalized = normalizeLocale(locale);
  await updateSettings({ uiLocale: normalized });
  return normalized;
}