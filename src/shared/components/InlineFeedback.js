"use client";

import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";

const ICONS = {
  error: "error",
  warning: "warning",
  success: "check_circle",
  info: "info",
};

const STYLES = {
  error: "text-red-500 bg-red-500/10 border-red-500/20",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  success: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  info: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
};

/**
 * Icon-first inline feedback — detail text only in tooltip, not as a noisy popup label.
 */
export default function InlineFeedback({
  variant = "error",
  message,
  iconOnly = true,
  className,
  size = "md",
}) {
  if (!message) return null;

  const iconSize = size === "sm" ? "text-[16px]" : size === "lg" ? "text-[24px]" : "text-[20px]";
  const pad = size === "sm" ? "p-1" : size === "lg" ? "p-3" : "p-2";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg border",
        pad,
        STYLES[variant] || STYLES.error,
        className,
      )}
      title={message}
      aria-label={message}
      role="status"
      data-i18n-skip
    >
      <span className={cn("material-symbols-outlined leading-none", iconSize)}>
        {ICONS[variant] || ICONS.error}
      </span>
      {!iconOnly ? (
        <span className="ml-1.5 text-xs leading-snug max-w-[240px] truncate">{message}</span>
      ) : null}
    </span>
  );
}

InlineFeedback.propTypes = {
  variant: PropTypes.oneOf(["error", "warning", "success", "info"]),
  message: PropTypes.string,
  iconOnly: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};