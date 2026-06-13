"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import PropTypes from "prop-types";
import { Breadcrumbs, Button } from "@heroui/react";
import Input from "@/shared/components/Input";
import ProviderIcon from "@/shared/components/ProviderIcon";
import HeaderMenu from "@/shared/components/HeaderMenu";
import { useHeaderSearchStore } from "@/store/headerSearchStore";
import { getDashboardPageMeta } from "@/shared/constants/pageMeta";
import { translate } from "@/i18n/runtime";
import { useDashboardAuth } from "@/shared/hooks/useDashboardAuth";
import useUserStore from "@/store/userStore";

export default function Header({ onMenuClick, showMenuButton = true }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useDashboardAuth();

  const pageMeta = useMemo(() => getDashboardPageMeta(pathname), [pathname]);
  const { title, icon, breadcrumbs } = pageMeta;

  const clearUser = useUserStore((s) => s.clearUser);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        clearUser();
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const localizedTitle = title ? translate(title) : "";

  return (
    <header className="dashboard-header glass-navbar shrink-0 z-20">
      <div className="dashboard-header-inner">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {showMenuButton && (
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onPress={onMenuClick}
              aria-label="Open navigation"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </Button>
          )}

          <div className="min-w-0 flex-1" data-i18n-skip="true">
            {breadcrumbs.length > 0 ? (
              <div className="min-w-0 space-y-1">
                <Breadcrumbs size="sm">
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const label = translate(crumb.label);
                    if (crumb.href && !isLast) {
                      return (
                        <Breadcrumbs.Item key={`${crumb.label}-${crumb.href}`} href={crumb.href}>
                          {label}
                        </Breadcrumbs.Item>
                      );
                    }
                    return (
                      <Breadcrumbs.Item key={`${crumb.label}-current`}>
                        <span className="inline-flex items-center gap-2 min-w-0">
                          {crumb.image && (
                            <ProviderIcon
                              src={crumb.image}
                              alt={label}
                              size={20}
                              className="object-contain rounded shrink-0"
                              fallbackText={label.slice(0, 2).toUpperCase()}
                            />
                          )}
                          <span className="font-display font-semibold text-foreground truncate">
                            {label}
                          </span>
                        </span>
                      </Breadcrumbs.Item>
                    );
                  })}
                </Breadcrumbs>
              </div>
            ) : localizedTitle ? (
              <div key={pathname} className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {icon && (
                    <span className="dashboard-header-icon shrink-0" aria-hidden="true">
                      <span className="material-symbols-outlined dashboard-header-icon-glyph">
                        {icon}
                      </span>
                    </span>
                  )}
                  <h1 className="font-display text-base sm:text-lg lg:text-xl font-semibold tracking-tight truncate text-foreground leading-tight">
                    {localizedTitle}
                  </h1>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <HeaderSearch />
          <div className="hidden sm:block h-6 w-px bg-divider" aria-hidden="true" />
          <HeaderMenu onLogout={handleLogout} user={authUser} isLoading={authLoading} />
        </div>
      </div>
    </header>
  );
}

function HeaderSearch() {
  const visible = useHeaderSearchStore((s) => s.visible);
  const query = useHeaderSearchStore((s) => s.query);
  const placeholder = useHeaderSearchStore((s) => s.placeholder);
  const setQuery = useHeaderSearchStore((s) => s.setQuery);

  if (!visible) return null;

  return (
    <div className="relative w-[140px] sm:w-[200px] lg:w-[240px]" data-i18n-skip="true">
      <Input
        icon="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        inputClassName="h-9 pr-8"
        className="gap-0"
      />
      {query && (
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          className="absolute right-0.5 top-1/2 -translate-y-1/2 min-w-7 w-7 h-7"
          onPress={() => setQuery("")}
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </Button>
      )}
    </div>
  );
}

Header.propTypes = {
  onMenuClick: PropTypes.func,
  showMenuButton: PropTypes.bool,
};