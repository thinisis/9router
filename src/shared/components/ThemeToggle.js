"use client";

import { Button } from "@heroui/react";
import { useTheme } from "@/shared/hooks/useTheme";
import { cn } from "@/shared/utils/cn";

export default function ThemeToggle({ className, variant = "default" }) {
  const { isDark, toggleTheme } = useTheme();

  const variants = {
    default: "text-default-500 hover:text-foreground",
    card: cn(
      "size-11 rounded-full",
      "bg-content1/80 hover:bg-content1",
      "border border-divider shadow-sm",
      "text-default-500 hover:text-primary"
    ),
  };

  return (
    <Button
      isIconOnly
      variant="ghost"
      size="sm"
      className={cn(variants[variant], className)}
      onPress={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="material-symbols-outlined text-[22px]">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </Button>
  );
}