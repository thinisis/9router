"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Dropdown, Chip, Skeleton } from "@heroui/react";
import { useTheme } from "@/shared/hooks/useTheme";
import { cn } from "@/shared/utils/cn";
import { LOCALE_COOKIE, DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { getLocaleDisplayName } from "@/shared/constants/locales";
import LocaleFlag from "./LocaleFlag";
import LanguageSwitcher from "./LanguageSwitcher";
import Avatar from "./Avatar";

function getLocaleFromCookie() {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const cookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith(`${LOCALE_COOKIE}=`));
  const value = cookie ? decodeURIComponent(cookie.split("=")[1]) : DEFAULT_LOCALE;
  return normalizeLocale(value);
}

export default function HeaderMenu({ onLogout, user, isLoading = false }) {
  const [langOpen, setLangOpen] = useState(false);
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const { isDark, toggleTheme } = useTheme();

  const displayName = user?.displayName || "";
  const loginMethod = user?.loginMethod || "Password";
  const email = user?.oidcEmail || null;
  const username = user?.oidcUsername || null;
  const accountLabel = email || (username ? `@${username}` : loginMethod === "OIDC" ? "SSO" : "Local");
  const showSkeleton = isLoading || !displayName;

  useEffect(() => {
    setLocale(getLocaleFromCookie());
  }, [langOpen]);

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger
          className={cn(
            "flex items-center gap-2 rounded-xl px-1.5 py-1 min-h-9",
            "bg-transparent hover:bg-default-100 data-[pressed]:bg-default-200 transition-colors",
            showSkeleton && "pointer-events-none opacity-80"
          )}
          data-i18n-skip="true"
        >
          {showSkeleton ? (
            <>
              <Skeleton className="size-8 rounded-full shrink-0" />
              <span className="hidden sm:flex flex-col gap-1.5 min-w-0">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-2.5 w-14 rounded-md" />
              </span>
            </>
          ) : (
            <>
              <Avatar name={displayName || email || "U"} size="sm" />
              <span className="hidden sm:flex flex-col items-start min-w-0 max-w-[160px]">
                <span className="text-xs font-semibold text-foreground truncate w-full text-left">
                  {displayName}
                </span>
                <span className="text-[10px] text-default-400 truncate w-full text-left">
                  {accountLabel}
                </span>
              </span>
            </>
          )}
          <span className="material-symbols-outlined text-[18px] text-default-400 shrink-0">
            expand_more
          </span>
        </Dropdown.Trigger>

        <Dropdown.Popover placement="bottom end" className="glass-popup w-72 p-0 overflow-hidden">
          {!showSkeleton && (
            <div className="flex items-center gap-3 px-3 py-3 border-b border-divider">
              <Avatar name={displayName || email || "U"} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
                {email ? (
                  <p className="text-xs text-default-500 truncate mt-0.5">{email}</p>
                ) : username ? (
                  <p className="text-xs text-default-500 truncate mt-0.5">@{username}</p>
                ) : (
                  <p className="text-xs text-default-500 mt-0.5">
                    {loginMethod === "OIDC" ? "Authenticated via OIDC" : "Password session"}
                  </p>
                )}
                <Chip size="sm" variant="flat" className="mt-2">
                  {loginMethod}
                </Chip>
              </div>
            </div>
          )}

          <Dropdown.Menu
            aria-label="User menu"
            onAction={(key) => {
              if (key === "language") setLangOpen(true);
              if (key === "theme") toggleTheme();
              if (key === "logout") onLogout();
            }}
          >
            <Dropdown.Item
              id="settings"
              href="/dashboard/profile"
              textValue="Settings"
            >
              <span className="flex items-start gap-2.5 w-full">
                <span className="material-symbols-outlined text-[18px] text-default-500 mt-0.5">settings</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">Settings</span>
                  <span className="block text-xs text-default-400">Preferences, security, OIDC</span>
                </span>
              </span>
            </Dropdown.Item>
            <Dropdown.Item id="language" textValue="Language">
              <span className="flex items-center justify-between gap-2 w-full">
                <span className="flex items-start gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-default-500 mt-0.5">language</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">Language</span>
                    <span className="block text-xs text-default-400">{getLocaleDisplayName(locale)}</span>
                  </span>
                </span>
                <LocaleFlag locale={locale} size="md" className="shrink-0" />
              </span>
            </Dropdown.Item>
            <Dropdown.Item id="theme" textValue="Appearance">
              <span className="flex items-center justify-between gap-2 w-full">
                <span className="flex items-start gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-default-500 mt-0.5">
                    {isDark ? "light_mode" : "dark_mode"}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">Appearance</span>
                    <span className="block text-xs text-default-400">
                      {isDark ? "Switch to light mode" : "Switch to dark mode"}
                    </span>
                  </span>
                </span>
                <Chip size="sm" variant="flat" data-i18n-skip="true">
                  {isDark ? "Dark" : "Light"}
                </Chip>
              </span>
            </Dropdown.Item>
            <Dropdown.Item id="logout" variant="danger" textValue="Sign out">
              <span className="flex items-start gap-2.5 w-full">
                <span className="material-symbols-outlined text-[18px] mt-0.5">logout</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">Sign out</span>
                  <span className="block text-xs opacity-80">End dashboard session</span>
                </span>
              </span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <LanguageSwitcher
        hideTrigger
        isOpen={langOpen}
        onClose={(next) => {
          setLangOpen(false);
          setLocale(next);
        }}
      />
    </>
  );
}

HeaderMenu.propTypes = {
  onLogout: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  user: PropTypes.shape({
    displayName: PropTypes.string,
    loginMethod: PropTypes.string,
    oidcEmail: PropTypes.string,
    oidcUsername: PropTypes.string,
  }),
};