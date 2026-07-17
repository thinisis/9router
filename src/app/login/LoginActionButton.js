"use client";

import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";
import { ensureGsapRegistered, gsap, useGSAP } from "@/shared/lib/gsapClient";
import { prefersReducedMotion } from "@/shared/utils/motion";

const variants = {
  primary:
    "login-action-btn-primary bg-primary/90 hover:bg-primary text-white border border-white/20 shadow-[0_8px_24px_-8px_rgba(43,127,232,0.55)]",
  secondary: "login-action-btn-secondary glass-panel-subtle text-text-main hover:bg-surface-3",
};

export default function LoginActionButton({
  children,
  variant = "primary",
  icon,
  loading = false,
  success = false,
  disabled = false,
  fullWidth = true,
  className,
  onClick,
  type = "button",
  ...rest
}) {
  const btnRef = useRef(null);
  const progressRef = useRef(null);
  const labelRef = useRef(null);
  const iconRef = useRef(null);

  useGSAP(
    () => {
      if (!loading || success || prefersReducedMotion()) return;
      const progress = progressRef.current;
      if (!progress) return;
      ensureGsapRegistered();
      gsap.fromTo(
        progress,
        { scaleX: 0, transformOrigin: "0% 50%" },
        { scaleX: 1, duration: 1.1, ease: "power1.inOut", repeat: -1, yoyo: true }
      );
      return () => gsap.killTweensOf(progress);
    },
    { dependencies: [loading, success] }
  );

  useEffect(() => {
    if (!success || prefersReducedMotion()) return;
    const btn = btnRef.current;
    const iconEl = iconRef.current;
    if (!btn || !iconEl) return;
    ensureGsapRegistered();
    gsap.fromTo(
      btn,
      { scale: 1 },
      { scale: 1.02, duration: 0.22, ease: "power2.out", yoyo: true, repeat: 1 }
    );
    gsap.fromTo(
      iconEl,
      { scale: 0.4, autoAlpha: 0, rotation: -40 },
      { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.42, ease: "back.out(2)" }
    );
  }, [success]);

  const handlePointerDown = () => {
    if (disabled || loading || success || prefersReducedMotion()) return;
    const btn = btnRef.current;
    if (!btn) return;
    ensureGsapRegistered();
    gsap.to(btn, { scale: 0.97, duration: 0.08, ease: "power2.in" });
  };

  const handlePointerUp = () => {
    if (disabled || loading || success || prefersReducedMotion()) return;
    const btn = btnRef.current;
    if (!btn) return;
    ensureGsapRegistered();
    gsap.to(btn, { scale: 1, duration: 0.28, ease: "elastic.out(1, 0.55)" });
  };

  return (
    <button
      ref={btnRef}
      type={type}
      data-login-submit
      disabled={disabled || loading || success}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={cn(
        "login-action-btn",
        variants[variant],
        fullWidth && "w-full",
        loading && "login-action-btn-loading",
        success && "login-action-btn-success",
        className
      )}
      {...rest}
    >
      <span className="login-action-btn-shine" aria-hidden="true" />
      {loading && !success && (
        <span ref={progressRef} className="login-action-btn-progress" aria-hidden="true" />
      )}
      <span ref={labelRef} className="login-action-btn-inner">
        {success ? (
          <span ref={iconRef} className="material-symbols-outlined login-action-btn-icon">
            check_circle
          </span>
        ) : loading ? (
          <span className="login-action-btn-spinner" aria-hidden="true" />
        ) : icon ? (
          <span className="material-symbols-outlined login-action-btn-icon">{icon}</span>
        ) : null}
        <span className="login-action-btn-label">
          {success ? "Authenticated" : loading ? "Signing in…" : children}
        </span>
      </span>
    </button>
  );
}

LoginActionButton.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(["primary", "secondary"]),
  icon: PropTypes.string,
  loading: PropTypes.bool,
  success: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
};