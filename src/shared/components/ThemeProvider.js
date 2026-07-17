"use client";

import { useEffect } from "react";
import useThemeStore from "@/store/themeStore";
import GsapRoot from "@/shared/components/GsapRoot";

export function ThemeProvider({ children }) {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <GsapRoot>{children}</GsapRoot>;
}

