"use client";

import { Avatar as HeroAvatar } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

const SIZES = {
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "lg",
};

function getInitials(name) {
  if (!name) return "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function Avatar({
  src,
  alt = "Avatar",
  name,
  size = "md",
  className,
}) {
  return (
    <HeroAvatar
      size={SIZES[size] || "md"}
      className={cn("shrink-0", className)}
    >
      {src ? <HeroAvatar.Image src={src} alt={alt} /> : null}
      <HeroAvatar.Fallback>{getInitials(name)}</HeroAvatar.Fallback>
    </HeroAvatar>
  );
}