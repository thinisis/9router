"use client";

import { Chip } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

const VARIANT_MAP = {
  default: { color: "default", variant: "soft" },
  primary: { color: "accent", variant: "soft" },
  success: { color: "success", variant: "soft" },
  warning: { color: "warning", variant: "soft" },
  error: { color: "danger", variant: "soft" },
  info: { color: "accent", variant: "soft" },
};

const SIZE_MAP = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  icon,
  className,
}) {
  const chipStyle = VARIANT_MAP[variant] || VARIANT_MAP.default;

  return (
    <Chip
      color={chipStyle.color}
      variant={chipStyle.variant}
      size={SIZE_MAP[size] || "md"}
      className={cn("max-w-full font-semibold whitespace-nowrap tabular-nums", className)}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full mr-1",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "error" && "bg-danger",
            variant === "info" && "bg-primary",
            variant === "primary" && "bg-primary",
            variant === "default" && "bg-default-400"
          )}
        />
      )}
      {icon && <span className="material-symbols-outlined text-[14px] mr-0.5">{icon}</span>}
      {children}
    </Chip>
  );
}