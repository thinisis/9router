"use client";

import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { ensureGsapRegistered, gsap } from "@/shared/lib/gsapClient";
import { prefersReducedMotion } from "@/shared/utils/motion";
import { cn } from "@/shared/utils/cn";

const TYPE_CONFIG = {
  success: { icon: "check_circle", className: "glass-toast--success" },
  error: { icon: "error", className: "glass-toast--error" },
  warning: { icon: "warning", className: "glass-toast--warning" },
  info: { icon: "info", className: "glass-toast--info" },
};

function GlassToastItem({ notification, onDismiss }) {
  const ref = useRef(null);
  const { type = "info", title, message, dismissible = true } = notification;
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, x: 0 });
      return undefined;
    }

    ensureGsapRegistered();
    gsap.fromTo(
      el,
      { x: 28, autoAlpha: 0, scale: 0.96 },
      { x: 0, autoAlpha: 1, scale: 1, duration: 0.38, ease: "power3.out" }
    );

    return () => {
      gsap.killTweensOf(el);
    };
  }, []);

  const handleDismiss = () => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) {
      onDismiss(notification.id);
      return;
    }
    ensureGsapRegistered();
    gsap.to(el, {
      x: 28,
      autoAlpha: 0,
      scale: 0.96,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => onDismiss(notification.id),
    });
  };

  return (
    <div
      ref={ref}
      className={cn("glass-toast", cfg.className)}
      role="status"
      aria-live="polite"
      data-i18n-skip
    >
      <div className="glass-toast-accent" aria-hidden="true" />
      <span className="material-symbols-outlined glass-toast-icon">{cfg.icon}</span>
      <div className="glass-toast-body min-w-0 flex-1">
        {title ? <p className="glass-toast-title">{title}</p> : null}
        <p className="glass-toast-message">{message}</p>
      </div>
      {dismissible ? (
        <button
          type="button"
          className="glass-toast-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss"
          data-no-press
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      ) : null}
    </div>
  );
}

export default function GlassToastContainer() {
  const notifications = useNotificationStore((s) => s.notifications);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return;
    ensureGsapRegistered();
    const items = containerRef.current.querySelectorAll(".glass-toast");
    if (items.length <= 1) return;
    gsap.from(items, {
      y: -6,
      autoAlpha: 0,
      duration: 0.28,
      stagger: 0.05,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, [notifications.length]);

  if (!notifications.length) return null;

  return (
    <div
      ref={containerRef}
      className="glass-toast-stack"
      aria-label="Notifications"
    >
      {notifications.map((n) => (
        <GlassToastItem
          key={n.id}
          notification={n}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
}