"use client";

import { useEffect } from "react";
import { ensureGsapRegistered, gsap } from "@/shared/lib/gsapClient";
import { prefersReducedMotion } from "@/shared/utils/motion";

const PRESSABLE =
  'button:not(:disabled):not([data-no-press]), [role="button"]:not([aria-disabled="true"]):not([data-no-press]), [data-pressable]:not([data-no-press])';

export function useGsapPress() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    ensureGsapRegistered();

    const onDown = (event) => {
      const target = event.target.closest(PRESSABLE);
      if (!target || target.closest("[data-no-press]")) return;
      gsap.killTweensOf(target);
      gsap.to(target, { scale: 0.98, duration: 0.1, ease: "power2.in", overwrite: true });
    };

    const onUp = (event) => {
      const target = event.target.closest(PRESSABLE);
      if (!target) return;
      gsap.to(target, {
        scale: 1,
        duration: 0.34,
        ease: "power2.out",
        overwrite: true,
      });
    };

    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("pointercancel", onUp, true);

    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("pointercancel", onUp, true);
    };
  }, []);
}