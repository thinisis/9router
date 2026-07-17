"use client";

import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";

const VARIANT_STYLES = {
  warning: "bg-amber-500/10 border-amber-500/30 text-amber-200",
  error: "bg-red-500/10 border-red-500/30 text-red-200",
  info: "bg-brand-500/10 border-brand-500/30 text-brand-200",
};

export default function ToolSetupAlert({ title, description, children, variant = "warning", className }) {
  return (
    <div
      className={cn(
        "rounded-[12px] border px-4 py-3 flex flex-col items-stretch gap-3",
        VARIANT_STYLES[variant] || VARIANT_STYLES.warning,
        className
      )}
      role="alert"
    >
      <div>
        {title ? <p className="font-medium text-sm text-text-main">{title}</p> : null}
        {description ? (
          <p className="text-sm leading-relaxed text-text-muted mt-0.5">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

ToolSetupAlert.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(["warning", "error", "info"]),
  className: PropTypes.string,
};
