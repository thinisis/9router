"use client";

import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";

export default function ProviderSection({
  title,
  subtitle,
  badge,
  badgeVariant = "default",
  icon,
  actions,
  children,
  className,
  "data-reveal": dataReveal,
}) {
  return (
    <section className={cn("flex flex-col gap-4", className)} data-reveal={dataReveal}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {icon && (
              <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
            )}
            <h2 className="font-display text-lg sm:text-xl font-semibold leading-tight">{title}</h2>
            {badge && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                  badgeVariant === "deletable" &&
                    "bg-amber-500/12 text-amber-700 dark:text-amber-300 border border-amber-500/25",
                  badgeVariant === "builtin" &&
                    "bg-primary/10 text-primary border border-primary/20",
                  badgeVariant === "default" &&
                    "bg-surface-3 text-text-muted border border-divider"
                )}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-text-muted max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:flex-shrink-0">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

ProviderSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  badge: PropTypes.string,
  badgeVariant: PropTypes.oneOf(["default", "deletable", "builtin"]),
  icon: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  "data-reveal": PropTypes.bool,
};