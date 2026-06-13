"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";

export default function RequestDetailSection({
  step,
  title,
  subtitle,
  icon,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  badge,
  children,
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const toggle = () => {
    const next = !open;
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  };

  return (
    <div className={cn("request-detail-section", open && "request-detail-section--open")}>
      <button
        type="button"
        className="request-detail-section-trigger"
        onClick={toggle}
        aria-expanded={open}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {step != null && (
            <span className="request-detail-section-step">{step}</span>
          )}
          {icon && (
            <span className="material-symbols-outlined request-detail-section-icon">{icon}</span>
          )}
          <div className="min-w-0 text-left">
            <p className="request-detail-section-title">{title}</p>
            {subtitle && (
              <p className="request-detail-section-subtitle">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge && (
            <span className="request-detail-section-badge">{badge}</span>
          )}
          <span
            className={cn(
              "material-symbols-outlined text-[20px] text-text-subtle transition-transform duration-200",
              open && "rotate-90"
            )}
          >
            chevron_right
          </span>
        </div>
      </button>
      {open && <div className="request-detail-section-body">{children}</div>}
    </div>
  );
}

RequestDetailSection.propTypes = {
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.string,
  defaultOpen: PropTypes.bool,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  badge: PropTypes.string,
  children: PropTypes.node,
};