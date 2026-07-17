"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AppShellSkeleton from "@/shared/components/AppShellSkeleton";
import { useGsapPress } from "@/shared/hooks/useGsapPress";
import { ensureGsapRegistered, gsap } from "@/shared/lib/gsapClient";
import { prefersReducedMotion } from "@/shared/utils/motion";
import { I18nReadyContext } from "./I18nReadyContext";
import { bootstrapI18n, finalizeI18n, reprocessDom } from "./runtime";

function getSkeletonVariant(pathname) {
  if (!pathname) return "dashboard";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname === "/login" || pathname === "/callback") return "minimal";
  return "minimal";
}

export function RuntimeI18nProvider({ children, initialLocale }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [bootTick, setBootTick] = useState(0);
  const contentRef = useRef(null);
  const skeletonRef = useRef(null);
  const prevPathRef = useRef(pathname);
  const skeletonVariant = getSkeletonVariant(pathname);

  useGsapPress();

  useLayoutEffect(() => {
    bootstrapI18n(initialLocale);
    setBootTick((n) => n + 1);
  }, [initialLocale]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await finalizeI18n(document.body);
      if (cancelled) return;
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [initialLocale]);

  useEffect(() => {
    if (!ready) return;

    const skeleton = skeletonRef.current;
    const content = contentRef.current;

    ensureGsapRegistered();

    if (prefersReducedMotion()) {
      if (skeleton) gsap.set(skeleton, { autoAlpha: 0, display: "none" });
      if (content) gsap.set(content, { autoAlpha: 1 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    if (skeleton) {
      tl.to(skeleton, { autoAlpha: 0, duration: 0.22, onComplete: () => {
        gsap.set(skeleton, { display: "none" });
      } }, 0);
    }

    if (content) {
      tl.fromTo(content, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28 }, 0.04);
    }
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    if (prevPathRef.current === pathname) return;

    prevPathRef.current = pathname;

    const page = document.querySelector("[data-page-content]");
    if (page) {
      reprocessDom(page);
    }

    if (prefersReducedMotion()) return;

    ensureGsapRegistered();
    const target = document.querySelector("[data-page-content]");
    if (!target) return;

    gsap.fromTo(
      target,
      { autoAlpha: 0, y: 6 },
      { autoAlpha: 1, y: 0, duration: 0.32, ease: "power2.out", clearProps: "transform" }
    );
  }, [pathname, ready]);

  return (
    <I18nReadyContext.Provider value={ready}>
      {!ready && (
        <div ref={skeletonRef} className="app-shell-skeleton-layer">
          <AppShellSkeleton variant={skeletonVariant} />
        </div>
      )}
      <div
        ref={contentRef}
        className={ready ? "i18n-content-visible" : "i18n-content-hidden"}
        data-i18n-content
        data-boot-tick={bootTick}
      >
        {children}
      </div>
    </I18nReadyContext.Provider>
  );
}