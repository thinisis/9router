"use client";

import { useEffect } from "react";
import { ensureGsapRegistered } from "@/shared/lib/gsapClient";

export default function GsapRoot({ children }) {
  useEffect(() => {
    ensureGsapRegistered();
  }, []);

  return children;
}