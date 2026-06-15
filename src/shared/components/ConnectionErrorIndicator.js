"use client";

import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";
import { translate, translateFormat } from "@/i18n/runtime";

const SIZES = {
  xs: { box: "size-5", icon: "text-[13px]", badge: "size-3.5 text-[8px] -right-1 -top-1" },
  sm: { box: "size-6", icon: "text-[15px]", badge: "size-3.5 text-[9px] -right-1 -top-1" },
  md: { box: "size-7", icon: "text-[18px]", badge: "size-4 text-[10px] -right-1.5 -top-1.5" },
};

function buildAriaLabel(count, errorCode) {
  if (errorCode) {
    return translateFormat("{count} connection errors ({code})", {
      count,
      code: errorCode,
    });
  }
  if (count === 1) return translate("Connection error");
  return translateFormat("{count} connection errors", { count });
}

export default function ConnectionErrorIndicator({
  count = 1,
  errorCode = null,
  size = "sm",
  className,
}) {
  if (!count || count < 1) return null;

  const s = SIZES[size] || SIZES.sm;
  const label = buildAriaLabel(count, errorCode);

  return (
    <span
      className={cn(
        "connection-error-indicator relative inline-flex shrink-0 items-center justify-center rounded-lg",
        "border border-danger/20 bg-danger/10 text-danger",
        s.box,
        className,
      )}
      title={label}
      aria-label={label}
      role="img"
      data-i18n-skip
    >
      <span className={cn("material-symbols-outlined leading-none", s.icon)} aria-hidden="true">
        link_off
      </span>
      {count > 1 ? (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-danger font-bold text-white",
            s.badge,
          )}
          aria-hidden="true"
        >
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </span>
  );
}

ConnectionErrorIndicator.propTypes = {
  count: PropTypes.number,
  errorCode: PropTypes.string,
  size: PropTypes.oneOf(["xs", "sm", "md"]),
  className: PropTypes.string,
};