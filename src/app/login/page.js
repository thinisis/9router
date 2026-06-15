"use client";

import { useState, useEffect, useRef } from "react";
import { Input, GlassAlert } from "@/shared/components";
import ThemeToggle from "@/shared/components/ThemeToggle";
import CreditsNotice from "@/shared/components/CreditsNotice";
import LoginActionButton from "./LoginActionButton";
import { useLoginAnimations } from "./useLoginAnimations";
import { useRouter } from "next/navigation";
import { ensureGsapRegistered, gsap, useGSAP } from "@/shared/lib/gsapClient";
import { prefersReducedMotion } from "@/shared/utils/motion";

const FEATURES = [
  { icon: "hub", label: "Multi-provider routing", desc: "Fallback combos across OAuth and API keys" },
  { icon: "security", label: "Secure access", desc: "Password, OIDC, and API key enforcement" },
  { icon: "terminal", label: "CLI & MITM ready", desc: "Configure IDE tools from one dashboard" },
];

const SUCCESS_HOLD_MS = 720;

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetHint, setResetHint] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);
  const [loadingAction, setLoadingAction] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [hasPassword, setHasPassword] = useState(null);
  const [authMode, setAuthMode] = useState("password");
  const [oidcConfigured, setOidcConfigured] = useState(false);
  const [oidcLoginLabel, setOidcLoginLabel] = useState("Sign in with OIDC");
  const [mustChange, setMustChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();
  const pageRef = useRef(null);
  const oidcLoadingRef = useRef(false);

  const {
    cardRef,
    overlayRef,
    formRef,
    runClickPulse,
    runLoadingAmbient,
    runSuccessExit,
    runErrorFeedback,
    runMustChangeTransition,
    resetAmbient,
  } = useLoginAnimations();

  useGSAP(
    () => {
      if (hasPassword === null) return;
      if (prefersReducedMotion()) {
        gsap.set("[data-login-brand],[data-login-feature],[data-login-card],[data-login-credit]", { autoAlpha: 1, x: 0, y: 0, scale: 1 });
        return;
      }
      ensureGsapRegistered();
      gsap.set("[data-login-brand],[data-login-feature],[data-login-card],[data-login-credit]", { autoAlpha: 1 });
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.from("[data-login-brand]", { x: -12, duration: 0.28 })
        .from("[data-login-feature]", { y: 6, duration: 0.22, stagger: 0.04 }, "-=0.18")
        .from("[data-login-card]", { y: 8, scale: 0.995, duration: 0.26 }, "-=0.14")
        .from("[data-login-credit]", { y: 4, duration: 0.18 }, "-=0.1");
    },
    { scope: pageRef, dependencies: [hasPassword] }
  );

  useEffect(() => {
    if (retryAfter <= 0) return;
    const id = setInterval(() => setRetryAfter((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [retryAfter]);

  useEffect(() => {
    async function checkAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

      try {
        const res = await fetch(`${baseUrl}/api/auth/status`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.requireLogin === false) {
            router.push("/dashboard");
            router.refresh();
            return;
          }
          setHasPassword(!!data.hasPassword);
          setAuthMode(data.authMode || "password");
          setOidcConfigured(data.oidcConfigured === true);
          setOidcLoginLabel(data.oidcLoginLabel || "Sign in with OIDC");
        } else {
          setHasPassword(true);
        }
      } catch {
        clearTimeout(timeoutId);
        setHasPassword(true);
      }
    }
    checkAuth();
  }, [router]);

  const navigateAfterSuccess = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const playSuccessAndNavigate = () => {
    setSubmitSuccess(true);
    runSuccessExit(() => {
      setTimeout(navigateAfterSuccess, prefersReducedMotion() ? 0 : 120);
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingAction("password");
    setSubmitSuccess(false);
    setError("");
    setResetHint("");
    runClickPulse();
    runLoadingAmbient();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.mustChangePassword) {
          setMustChange(true);
          setLoadingAction(null);
          resetAmbient();
          runMustChangeTransition();
          return;
        }
        await new Promise((r) => setTimeout(r, prefersReducedMotion() ? 0 : SUCCESS_HOLD_MS));
        playSuccessAndNavigate();
        return;
      }

      const data = await res.json();
      setError(data.error || "Invalid password");
      if (data.resetHint) setResetHint(data.resetHint);
      if (data.retryAfter) setRetryAfter(Number(data.retryAfter));
      setLoadingAction(null);
      resetAmbient();
      runErrorFeedback();
    } catch {
      setError("An error occurred. Please try again.");
      setLoadingAction(null);
      resetAmbient();
      runErrorFeedback();
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setLoadingAction("setPassword");
    setSubmitSuccess(false);
    setError("");
    runClickPulse();
    runLoadingAmbient();

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });
      if (res.ok) {
        await new Promise((r) => setTimeout(r, prefersReducedMotion() ? 0 : SUCCESS_HOLD_MS));
        playSuccessAndNavigate();
        return;
      }
      const data = await res.json();
      setError(data.error || "Failed to set password");
      setLoadingAction(null);
      resetAmbient();
      runErrorFeedback();
    } catch {
      setError("An error occurred. Please try again.");
      setLoadingAction(null);
      resetAmbient();
      runErrorFeedback();
    }
  };

  const handleOidcLogin = () => {
    if (oidcLoadingRef.current) return;
    oidcLoadingRef.current = true;
    setLoadingAction("oidc");
    runClickPulse();
    runLoadingAmbient();

    if (!prefersReducedMotion()) {
      ensureGsapRegistered();
      const btn = document.querySelector("[data-login-oidc]");
      if (btn) {
        gsap.to(btn, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 });
      }
    }

    setTimeout(() => {
      window.location.href = "/api/auth/oidc/start";
    }, prefersReducedMotion() ? 0 : 380);
  };

  const oidcAvailable = oidcConfigured && ["oidc", "both"].includes(authMode);
  const passwordAvailable = authMode !== "oidc" || !oidcConfigured;

  const subtitle =
    authMode === "oidc" && oidcConfigured
      ? "Sign in with your identity provider to access the control plane."
      : "Authenticate to manage providers, endpoints, and routing.";

  const authPending = hasPassword === null;

  const urlError =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("error")
      : null;

  return (
    <div className="login-shell">
      <div className="liquid-bg" aria-hidden="true" />
      <div className="login-orbs" aria-hidden="true">
        <span className="login-orb login-orb-a" />
        <span className="login-orb login-orb-b" />
        <span className="login-orb login-orb-c" />
      </div>

      <div ref={overlayRef} className="login-success-overlay" aria-hidden="true" />

      <div className="login-topbar">
        <ThemeToggle className="login-theme-toggle" />
      </div>

      <div ref={pageRef} className="login-layout">
        <aside className="login-brand-panel" data-login-brand>
          <div className="login-brand-mark">
            <div className="login-brand-icon">
              <span className="material-symbols-outlined">hub</span>
            </div>
            <div>
              <p className="login-brand-eyebrow">Control plane</p>
              <h1 className="login-brand-title">9Router</h1>
            </div>
          </div>

          <p className="login-brand-lead">{subtitle}</p>

          <ul className="login-feature-list">
            {FEATURES.map((feature) => (
              <li key={feature.label} className="login-feature-item" data-login-feature>
                <span className="login-feature-icon material-symbols-outlined">{feature.icon}</span>
                <div>
                  <p className="login-feature-label">{feature.label}</p>
                  <p className="login-feature-desc">{feature.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <main className="login-form-panel">
          <div className="login-mobile-hero lg:hidden" data-login-brand>
            <div className="login-brand-icon login-brand-icon-sm">
              <span className="material-symbols-outlined">hub</span>
            </div>
            <div>
              <h1 className="login-mobile-title">9Router</h1>
              <p className="login-mobile-sub">{subtitle}</p>
            </div>
          </div>

          <div ref={cardRef} className="login-glass-card" data-login-card>
            {authPending && (
              <div className="login-card-pending" aria-live="polite">
                <div className="login-loading-ring login-loading-ring--sm" />
                <span className="text-xs text-text-muted">Preparing sign-in…</span>
              </div>
            )}
            <div className={`login-card-body ${authPending ? "login-card-body--pending" : ""}`}>
            <div className="login-card-header">
              <h2 className="login-card-title">
                {mustChange ? "Set new password" : "Sign in"}
              </h2>
              <p className="login-card-sub">
                {mustChange
                  ? "Remote access requires a stronger password before continuing."
                  : oidcAvailable && !passwordAvailable
                    ? "Use your configured identity provider."
                    : "Enter credentials or continue with SSO."}
              </p>
            </div>

            {urlError && (
              <GlassAlert
                variant="error"
                hideIcon
                message={`Authentication failed: ${urlError.replace(/_/g, " ")}`}
                className="mb-4"
                data-login-error-alert
              />
            )}

            <div ref={formRef}>
              {mustChange ? (
                <form onSubmit={handleSetNewPassword} className="login-form">
                  <GlassAlert
                    variant="warning"
                    hideIcon
                    message="Set a new password before accessing the dashboard remotely."
                  />
                  <Input
                    label="New password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  {error && (
                    <div data-login-error-alert>
                      <GlassAlert variant="error" hideIcon message={error} />
                    </div>
                  )}
                  <LoginActionButton
                    type="submit"
                    variant="primary"
                    loading={loadingAction === "setPassword"}
                    success={submitSuccess}
                    disabled={!newPassword}
                  >
                    Set password
                  </LoginActionButton>
                </form>
              ) : (
                <div className="login-form">
                  {oidcAvailable && (
                    <LoginActionButton
                      type="button"
                      variant="primary"
                      icon="login"
                      loading={loadingAction === "oidc"}
                      disabled={loadingAction === "password" || loadingAction === "setPassword"}
                      onClick={handleOidcLogin}
                      data-login-oidc
                    >
                      {oidcLoginLabel}
                    </LoginActionButton>
                  )}

                  {oidcAvailable && passwordAvailable && (
                    <div className="login-divider">
                      <span>or continue with password</span>
                    </div>
                  )}

                  {passwordAvailable ? (
                    <form onSubmit={handleLogin} className="login-form">
                      <Input
                        label="Password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus={!oidcAvailable}
                        icon="lock"
                      />
                      {error && (
                        <div data-login-error-alert>
                          <GlassAlert variant="error" hideIcon message={error} />
                        </div>
                      )}
                      {retryAfter > 0 && (
                        <GlassAlert
                          variant="warning"
                          hideIcon
                          message={`Locked. Retry in ${retryAfter}s.`}
                        />
                      )}
                      {resetHint && (
                        <p className="login-hint">
                          Forgot password? Use{" "}
                          <code className="login-hint-code">9router</code> CLI → Settings → Reset Password.
                        </p>
                      )}
                      <LoginActionButton
                        type="submit"
                        variant={oidcAvailable ? "secondary" : "primary"}
                        loading={loadingAction === "password" && !submitSuccess}
                        success={submitSuccess}
                        disabled={retryAfter > 0 || loadingAction === "oidc" || !password}
                      >
                        {retryAfter > 0 ? `Wait ${retryAfter}s` : "Sign in"}
                      </LoginActionButton>
                    </form>
                  ) : (
                    error && (
                      <div data-login-error-alert>
                        <GlassAlert variant="error" hideIcon message={error} />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
            </div>
          </div>

          <div data-login-credit className="login-credits">
            <CreditsNotice compact />
          </div>
        </main>
      </div>
    </div>
  );
}