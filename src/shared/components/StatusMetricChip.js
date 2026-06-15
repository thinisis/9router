"use client";

import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";

const VARIANT_STYLES = {
  default: "border-black/10 bg-black/[0.02] text-text-primary dark:border-white/10 dark:bg-white/[0.03]",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
  info: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  muted: "border-black/10 bg-black/[0.02] text-text-muted dark:border-white/10 dark:bg-white/[0.03]",
};

/**
 * Compact metric chip — hides zero values by default to avoid noisy "Failed 0" rows.
 */
export default function StatusMetricChip({
  icon,
  label,
  value,
  variant = "default",
  hideWhenZero = true,
  iconOnly = false,
  title,
  className,
}) {
  const numericValue = typeof value === "number" ? value : Number(value);
  const isZero = Number.isFinite(numericValue) && numericValue === 0;

  if (hideWhenZero && isZero) return null;

  const displayValue = Number.isFinite(numericValue) ? numericValue.toLocaleString() : value;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium",
        VARIANT_STYLES[variant] || VARIANT_STYLES.default,
        className,
      )}
      title={title || (iconOnly && label ? `${label}: ${displayValue}` : undefined)}
      data-i18n-skip
    >
      {icon ? (
        <span className="material-symbols-outlined text-[14px] leading-none" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {!iconOnly && label ? <span className="text-text-muted font-normal">{label}</span> : null}
      <span className="tabular-nums font-semibold">{displayValue}</span>
    </span>
  );
}

StatusMetricChip.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  variant: PropTypes.oneOf(["default", "success", "warning", "danger", "info", "muted"]),
  hideWhenZero: PropTypes.bool,
  iconOnly: PropTypes.bool,
  title: PropTypes.string,
  className: PropTypes.string,
};