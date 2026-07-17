"use client";

import { Button as HeroButton, Spinner } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

const VARIANT_MAP = {
  primary: "primary",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  danger: "danger",
  success: "primary",
};

const SIZE_MAP = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  onClick,
  type = "button",
  ...props
}) {
  const heroVariant = VARIANT_MAP[variant] || "primary";

  return (
    <HeroButton
      variant={heroVariant}
      size={SIZE_MAP[size] || "md"}
      isDisabled={disabled || loading}
      fullWidth={fullWidth}
      type={type}
      data-pressable
      className={cn(
        "gsap-pressable",
        variant === "success" && "!bg-success hover:opacity-90",
        className
      )}
      onPress={(e) => {
        props.onPress?.(e);
        onClick?.(e);
      }}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" color="current" />
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="material-symbols-outlined text-[18px]">{iconRight}</span>
      )}
    </HeroButton>
  );
}