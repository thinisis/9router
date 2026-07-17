"use client";

import { Switch } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

const SIZE_MAP = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

export default function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className,
}) {
  return (
    <Switch
      isSelected={checked}
      onChange={onChange}
      isDisabled={disabled}
      size={SIZE_MAP[size] || "md"}
      className={cn("gap-3", className)}
    >
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      {(label || description) && (
        <Switch.Content>
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {description && <span className="text-xs text-text-muted block">{description}</span>}
        </Switch.Content>
      )}
    </Switch>
  );
}