"use client";

import Link from "next/link";
import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";
import Button from "./Button";

const VARIANT_STYLES = {
  warning: "bg-amber-500/10 border-amber-500/30",
  error: "bg-red-500/10 border-red-500/30",
  success: "bg-green-500/10 border-green-500/30",
  info: "bg-brand-500/10 border-brand-500/30",
};

const ICONS = {
  warning: "shield_lock",
  error: "error",
  success: "check_circle",
  info: "info",
};

export default function GlassAlert({ variant = "warning", message, action, className, hideIcon = false }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[12px] border px-4 py-3",
        VARIANT_STYLES[variant] || VARIANT_STYLES.warning,
        className,
      )}
      role="alert"
    >
      {!hideIcon && (
        <span className="material-symbols-outlined text-[18px] shrink-0 text-text-main">
          {ICONS[variant] || ICONS.warning}
        </span>
      )}
      <div className="min-w-0 flex-1 text-sm leading-snug text-text-main">
        {message}
      </div>
      {action && (
        action.href ? (
          action.href.startsWith("#") ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                document.getElementById(action.href.slice(1))?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {action.label}
            </Button>
          ) : (
            <Link href={action.href}>
              <Button size="sm" variant="ghost">{action.label}</Button>
            </Link>
          )
        ) : (
          <Button size="sm" variant="ghost" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}

GlassAlert.propTypes = {
  variant: PropTypes.oneOf(["warning", "error", "success", "info"]),
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  action: PropTypes.shape({
    label: PropTypes.string,
    href: PropTypes.string,
    onClick: PropTypes.func,
  }),
  className: PropTypes.string,
  hideIcon: PropTypes.bool,
};
