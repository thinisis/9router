"use client";

import PropTypes from "prop-types";
import { Card } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

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
    <Card variant="default" className={cn("overflow-hidden", className)} data-reveal>
      <HeaderTag
        type={collapsible ? "button" : undefined}
        onClick={collapsible ? onToggle : undefined}
        className={cn(
          "w-full flex items-start gap-4 p-5 sm:p-6 text-left",
          collapsible && "hover:bg-default-100/50 transition-colors cursor-pointer"
        )}
      >
        {icon && (
          <div className="flex items-center justify-center size-11 shrink-0 rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-default-500 mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        {collapsible && (
          <span className="material-symbols-outlined text-default-400 shrink-0 mt-1">
            {expanded ? "expand_less" : "expand_more"}
          </span>
        )}
      </HeaderTag>

      {(!collapsible || expanded) && (
        <Card.Content className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-divider">
          <div className="pt-5">{children}</div>
        </Card.Content>
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