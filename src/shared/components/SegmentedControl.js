"use client";

import { cn } from "@/shared/utils/cn";

export default function SegmentedControl({
  options = [],
  value,
  onChange,
  size = "md",
  className,
}) {
  return (
    <div
      className={cn(
        "glass-segmented",
        size === "sm" && "glass-segmented--sm",
        size === "lg" && "glass-segmented--lg",
        className
      )}
      role="tablist"
      aria-label="Options"
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-pressable
            onClick={() => onChange?.(option.value)}
            className={cn(
              "glass-segmented-item gsap-pressable",
              active && "glass-segmented-item-active"
            )}
          >
            {option.icon && (
              <span
                className={cn(
                  "material-symbols-outlined glass-segmented-icon",
                  active && "fill-1"
                )}
              >
                {option.icon}
              </span>
            )}
            <span className="glass-segmented-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}