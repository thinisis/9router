"use client";

import { useRef, useCallback } from "react";
import { ensureGsapRegistered, gsap } from "@/shared/lib/gsapClient";
import { prefersReducedMotion } from "@/shared/utils/motion";

export function useLoginAnimations() {
  const cardRef = useRef(null);
  const overlayRef = useRef(null);
  const formRef = useRef(null);

  const runClickPulse = useCallback(() => {
    if (prefersReducedMotion()) return;
    ensureGsapRegistered();
    const card = cardRef.current;
    if (!card) return;
    gsap.fromTo(
      card,
      { boxShadow: "var(--login-card-glow-idle)" },
      {
        boxShadow: "var(--login-card-glow-active)",
        duration: 0.35,
        ease: "power2.out",
      }
    );
  }, []);

  const runLoadingAmbient = useCallback(() => {
    if (prefersReducedMotion()) return;
    ensureGsapRegistered();
    const orbs = document.querySelectorAll(".login-orb");
    gsap.to(orbs, {
      scale: 1.08,
      opacity: 0.72,
      duration: 0.8,
      stagger: 0.08,
      ease: "power2.out",
    });
  }, []);

  const runSuccessExit = useCallback((onComplete) => {
    if (prefersReducedMotion()) {
      onComplete?.();
      return;
    }
    ensureGsapRegistered();
    const card = cardRef.current;
    const overlay = overlayRef.current;
    const tl = gsap.timeline({ onComplete });

    if (overlay) {
      tl.set(overlay, { autoAlpha: 0, visibility: "hidden", pointerEvents: "none" })
        .to(overlay, { autoAlpha: 1, visibility: "visible", duration: 0.35, ease: "power2.out" }, 0.15);
    }

    if (card) {
      tl.to(
        card,
        {
          y: -18,
          scale: 0.97,
          autoAlpha: 0,
          duration: 0.5,
          ease: "power3.inOut",
        },
        0.25
      );
    }

    tl.to(
      ".login-brand-panel, .login-mobile-hero, .login-credits",
      { autoAlpha: 0, y: -10, duration: 0.38, stagger: 0.05, ease: "power2.in" },
      0.2
    );

    tl.to(
      ".login-orb",
      { scale: 1.2, opacity: 0.9, duration: 0.55, ease: "power2.out" },
      0.15
    );
  }, []);

  const runErrorFeedback = useCallback(() => {
    if (prefersReducedMotion()) return;
    ensureGsapRegistered();
    const card = cardRef.current;
    const form = formRef.current;
    if (card) {
      gsap.fromTo(
        card,
        { x: 0 },
        { x: -10, duration: 0.07, repeat: 5, yoyo: true, ease: "power1.inOut" }
      );
      gsap.to(card, {
        boxShadow: "var(--login-card-glow-error)",
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      });
    }
    if (form) {
      gsap.fromTo(
        form,
        { autoAlpha: 0.65 },
        { autoAlpha: 1, duration: 0.35, ease: "power2.out" }
      );
    }
    gsap.from("[data-login-error-alert]", {
      y: -10,
      autoAlpha: 0,
      duration: 0.38,
      ease: "power3.out",
    });
    gsap.to(".login-orb", {
      scale: 1,
      opacity: 0.55,
      duration: 0.5,
      ease: "power2.out",
    });
  }, []);

  const runMustChangeTransition = useCallback(() => {
    if (prefersReducedMotion()) return;
    ensureGsapRegistered();
    const form = formRef.current;
    if (!form) return;
    gsap.fromTo(
      form,
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }
    );
  }, []);

  const resetAmbient = useCallback(() => {
    if (prefersReducedMotion()) return;
    ensureGsapRegistered();
    gsap.to(".login-orb", {
      scale: 1,
      opacity: 0.55,
      duration: 0.45,
      ease: "power2.out",
    });
    const card = cardRef.current;
    if (card) {
      gsap.to(card, {
        boxShadow: "var(--login-card-glow-idle)",
        duration: 0.35,
      });
    }
  }, []);

  return {
    cardRef,
    overlayRef,
    formRef,
    runClickPulse,
    runLoadingAmbient,
    runSuccessExit,
    runErrorFeedback,
    runMustChangeTransition,
    resetAmbient,
  };
}