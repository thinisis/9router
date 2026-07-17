"use client";

import { useRef } from "react";
import { useI18nReady } from "@/i18n/I18nReadyContext";
import { ensureGsapRegistered, gsap, useGSAP } from "@/shared/lib/gsapClient";
import { prefersReducedMotion } from "@/shared/utils/motion";

export function useReveal({
  selector = "[data-reveal]",
  delay = 0,
  stagger = 0.05,
  y = 12,
  duration = 0.44,
} = {}) {
  const scopeRef = useRef(null);
  const i18nReady = useI18nReady();

  useGSAP(
    () => {
      if (!i18nReady) return;

      const targets = scopeRef.current?.querySelectorAll(selector);
      if (!targets?.length) return;

      if (prefersReducedMotion()) {
        gsap.set(targets, { autoAlpha: 1, y: 0 });
        return;
      }

      ensureGsapRegistered();
      gsap.from(targets, {
        y,
        autoAlpha: 0,
        duration,
        stagger,
        delay,
        ease: "power3.out",
        clearProps: "transform",
      });
    },
    { scope: scopeRef, dependencies: [i18nReady], revertOnUpdate: true }
  );

  return scopeRef;
}