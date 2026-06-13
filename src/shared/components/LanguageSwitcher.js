"use client";

import { useState, useEffect, useMemo } from "react";
import { LOCALES, LOCALE_COOKIE, DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { reloadTranslations } from "@/i18n/runtime";
import { getLocaleMeta, getLocaleDisplayName } from "@/shared/constants/locales";
import LocaleFlag from "./LocaleFlag";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { cn } from "@/shared/utils/cn";

function getLocaleFromCookie() {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const cookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith(`${LOCALE_COOKIE}=`));
  const value = cookie ? decodeURIComponent(cookie.split("=")[1]) : DEFAULT_LOCALE;
  return normalizeLocale(value);
}

export default function LanguageSwitcher({
  className = "",
  isOpen: controlledOpen,
  onClose,
  hideTrigger = false,
}) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [isPending, setIsPending] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isControlled = typeof controlledOpen === "boolean";
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = (value) => {
    if (!value) setQuery("");
    if (isControlled) {
      if (!value && onClose) onClose(locale);
    } else {
      setInternalOpen(value);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/locale", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data?.locale) {
            setLocale(data.locale);
            await reloadTranslations(data.locale);
            return;
          }
        }
      } catch {
        // fall back to cookie below
      }
      if (!cancelled) setLocale(getLocaleFromCookie());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredLocales = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LOCALES;
    return LOCALES.filter((item) => {
      const { nativeName, englishName } = getLocaleMeta(item);
      return (
        item.toLowerCase().includes(q) ||
        nativeName.toLowerCase().includes(q) ||
        englishName.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const handleSetLocale = async (nextLocale) => {
    if (nextLocale === locale || isPending) return;

    setIsPending(true);
    setIsOpen(false);
    try {
      const res = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Failed to set locale (${res.status})`);
      }
      const data = await res.json().catch(() => ({}));
      const savedLocale = data?.locale || nextLocale;
      await reloadTranslations(savedLocale);
      setLocale(savedLocale);
    } catch (err) {
      console.error("Failed to set locale:", err);
    } finally {
      setIsPending(false);
    }
  };

  const currentMeta = getLocaleMeta(locale);

  return (
    <div className={className}>
      {!hideTrigger && (
        <Button
          variant="ghost"
          size="sm"
          onPress={() => setIsOpen(!isOpen)}
          isDisabled={isPending}
          className="gap-2"
          title="Language"
          data-i18n-skip="true"
        >
          <LocaleFlag locale={locale} size="sm" />
          <span>{currentMeta.nativeName}</span>
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Language"
        size="md"
        className="!max-w-md"
      >
        <div className="flex flex-col gap-4" data-i18n-skip="true">
          <p className="text-sm text-default-500 -mt-1">
            Display language for the dashboard
          </p>
          <Input
            icon="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search languages..."
            inputClassName="h-10"
          />
          <div
            className="max-h-[min(50vh,320px)] overflow-y-auto custom-scrollbar -mx-1 flex flex-col gap-1"
            role="listbox"
            aria-label="Languages"
          >
            {filteredLocales.length === 0 ? (
              <p className="text-sm text-default-500 text-center py-6">
                No languages match your search.
              </p>
            ) : (
              filteredLocales.map((item) => {
                const active = locale === item;
                const meta = getLocaleMeta(item);
                return (
                  <button
                    key={item}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => handleSetLocale(item)}
                    disabled={isPending}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors",
                      active
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-default-100 text-foreground",
                      isPending && "opacity-60"
                    )}
                  >
                    <LocaleFlag locale={item} size="lg" className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{meta.nativeName}</span>
                      <span className="block text-xs text-default-400">{meta.englishName}</span>
                    </span>
                    {active && (
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export { getLocaleDisplayName };