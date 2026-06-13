import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { LOCALE_COOKIE, normalizeLocale, isSupportedLocale } from "@/i18n/config";
import { getSettings } from "@/lib/localDb";
import { persistUiLocale, resolveServerLocale, SYSTEM_DEFAULT_LOCALE } from "@/lib/i18n/serverLocale";

function setLocaleCookie(cookieStore, locale) {
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 5,
    sameSite: "lax",
  });
}

export async function GET() {
  try {
    const locale = await resolveServerLocale();
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
    if (cookieLocale !== locale) {
      setLocaleCookie(cookieStore, locale);
    }
    return NextResponse.json({ locale, source: "settings" });
  } catch (error) {
    return NextResponse.json(
      { locale: SYSTEM_DEFAULT_LOCALE, source: "fallback", error: error?.message },
      { status: 200 }
    );
  }
}

export async function POST(request) {
  try {
    const { locale } = await request.json();

    if (!locale || !isSupportedLocale(locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const normalized = await persistUiLocale(locale);
    const cookieStore = await cookies();
    setLocaleCookie(cookieStore, normalized);

    return NextResponse.json({ success: true, locale: normalized, source: "settings" });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to set locale" },
      { status: 500 }
    );
  }
}