"use client";

import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";
import Card from "./Card";

export default function SettingsSection({
  icon,
  title,
  description,
  children,
  expanded,
  onToggle,
  collapsible = false,
  className,
}) {
  const HeaderTag = collapsible ? "button" : "div";

  return (
    <Card padding="none" className={cn("overflow-hidden", className)} data-reveal>
      <HeaderTag
        type={collapsible ? "button" : undefined}
        onClick={collapsible ? onToggle : undefined}
        className={cn(
          "w-full flex items-start gap-4 p-5 sm:p-6 text-left",
          collapsible && "hover:bg-surface-2 transition-colors cursor-pointer"
        )}
      >
        {icon && (
          <div className="flex items-center justify-center size-11 shrink-0 rounded-xl bg-brand-500/10 text-brand-500">
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight text-text-main">{title}</h2>
          {description && (
            <p className="text-sm text-text-muted mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        {collapsible && (
          <span className="material-symbols-outlined text-text-muted shrink-0 mt-1">
            {expanded ? "expand_less" : "expand_more"}
          </span>
        )}
      </HeaderTag>

      {(!collapsible || expanded) && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-border-subtle">
          <div className="pt-5">{children}</div>
        </div>
      )}
    </Card>
  );
}

SettingsSection.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  collapsible: PropTypes.bool,
  className: PropTypes.string,
};
