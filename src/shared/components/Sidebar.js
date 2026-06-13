"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import { cn } from "@/shared/utils/cn";
import { APP_CONFIG } from "@/shared/constants/config";
import { MEDIA_PROVIDER_KINDS } from "@/shared/constants/providers";
import { translate } from "@/i18n/runtime";
import CreditsNotice from "./CreditsNotice";

const VISIBLE_MEDIA_KINDS = ["embedding", "image", "tts", "stt"];
const COMBINED_WEB_ITEM = {
  id: "web",
  label: "Web Fetch & Search",
  icon: "travel_explore",
  href: "/dashboard/media-providers/web",
};

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/dashboard/endpoint", label: "Endpoint", icon: "api" },
  { href: "/dashboard/providers", label: "Providers", icon: "dns" },
  { href: "/dashboard/combos", label: "Combos", icon: "layers" },
  { href: "/dashboard/usage", label: "Usage", icon: "bar_chart" },
  { href: "/dashboard/quota", label: "Quota Tracker", icon: "data_usage" },
  { href: "/dashboard/mitm", label: "MITM", icon: "security" },
  { href: "/dashboard/cli-tools", label: "CLI Tools", icon: "terminal" },
];

const debugItems = [
  { href: "/dashboard/console-log", label: "Console Log", icon: "terminal" },
  { href: "/dashboard/translator", label: "Translator", icon: "translate" },
];

const systemItems = [
  { href: "/dashboard/proxy-pools", label: "Proxy Pools", icon: "lan" },
  { href: "/dashboard/skills", label: "Skills", icon: "extension" },
];

function NavLink({ item, active, onClose }) {
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        "dashboard-nav-link",
        active && "dashboard-nav-link--active"
      )}
      data-i18n-skip="true"
    >
      <span
        className={cn(
          "material-symbols-outlined text-[18px]",
          active ? "fill-1 text-primary" : "text-default-500"
        )}
      >
        {item.icon}
      </span>
      <span className="text-[13px] font-medium">{translate(item.label)}</span>
    </Link>
  );
}

NavLink.propTypes = {
  item: PropTypes.shape({
    href: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  active: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const [mediaOpen, setMediaOpen] = useState(false);
  const [enableTranslator, setEnableTranslator] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.enableTranslator) setEnableTranslator(true);
      })
      .catch(() => {});
  }, []);

  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/dashboard/endpoint") {
      return pathname.startsWith("/dashboard/endpoint");
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="dashboard-sidebar flex w-[17.5rem] shrink-0 flex-col min-h-full lg:w-72 border-r border-divider bg-background">
      <div className="px-5 pt-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose} data-i18n-skip="true">
          <div className="flex items-center justify-center size-10 rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[22px]">hub</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              {APP_CONFIG.name}
            </span>
            <span className="text-[11px] text-default-400 font-medium">v{APP_CONFIG.version}</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} onClose={onClose} />
        ))}

        <div className="pt-4 mt-3 border-t border-divider space-y-0.5">
          <p className="px-3 pb-2 text-[10px] font-semibold text-default-400 uppercase tracking-[0.14em]" data-i18n-skip="true">
            {translate("System")}
          </p>

          <Button
            variant="ghost"
            className={cn(
              "dashboard-nav-link w-full justify-start",
              pathname.startsWith("/dashboard/media-providers") && "dashboard-nav-link--active"
            )}
            onPress={() => setMediaOpen((v) => !v)}
          >
            <span className="material-symbols-outlined text-[18px] text-default-500">perm_media</span>
            <span className="text-[13px] font-medium flex-1 text-left">{translate("Media Providers")}</span>
            <span
              className="material-symbols-outlined text-[14px] transition-transform"
              style={{ transform: mediaOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              expand_more
            </span>
          </Button>

          {mediaOpen && (
            <div className="ml-2 pl-2 border-l border-divider space-y-0.5">
              {MEDIA_PROVIDER_KINDS.filter((k) => VISIBLE_MEDIA_KINDS.includes(k.id)).map((kind) => (
                <Link
                  key={kind.id}
                  href={`/dashboard/media-providers/${kind.id}`}
                  onClick={onClose}
                  className={cn(
                    "dashboard-nav-link text-sm py-1.5",
                    pathname.startsWith(`/dashboard/media-providers/${kind.id}`) && "dashboard-nav-link--active"
                  )}
                  data-i18n-skip="true"
                >
                  <span className="material-symbols-outlined text-[16px]">{kind.icon}</span>
                  <span>{kind.label}</span>
                </Link>
              ))}
              <Link
                href={COMBINED_WEB_ITEM.href}
                onClick={onClose}
                className={cn(
                  "dashboard-nav-link text-sm py-1.5",
                  pathname.startsWith(COMBINED_WEB_ITEM.href) && "dashboard-nav-link--active"
                )}
                data-i18n-skip="true"
              >
                <span className="material-symbols-outlined text-[16px]">{COMBINED_WEB_ITEM.icon}</span>
                <span>{COMBINED_WEB_ITEM.label}</span>
              </Link>
            </div>
          )}

          {systemItems.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} onClose={onClose} />
          ))}

          {debugItems.map((item) => {
            const show = item.href !== "/dashboard/translator" || enableTranslator;
            return show ? (
              <NavLink key={item.href} item={item} active={isActive(item.href)} onClose={onClose} />
            ) : null;
          })}

          <NavLink
            item={{ href: "/dashboard/profile", label: "Settings", icon: "settings" }}
            active={isActive("/dashboard/profile")}
            onClose={onClose}
          />
        </div>
      </nav>

      <div className="px-4 py-4 mt-auto border-t border-divider">
        <CreditsNotice compact />
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  onClose: PropTypes.func,
};