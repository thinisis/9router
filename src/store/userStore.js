"use client";

import { create } from "zustand";

let inflight = null;

function mapAuthResponse(data) {
  if (!data) return null;
  return {
    displayName: data.displayName || "",
    loginMethod: data.loginMethod || "Password",
    oidcEmail: data.oidcEmail || null,
    oidcName: data.oidcName || null,
    oidcUsername: data.oidcUsername || null,
    oidcLogin: !!data.oidcLogin,
  };
}

const useUserStore = create((set, get) => ({
  user: null,
  status: "idle",
  error: null,

  setUser: (user) => set({ user, status: "ready" }),

  clearUser: () => set({ user: null, status: "idle" }),

  fetchAuth: async ({ force = false } = {}) => {
    const { status } = get();
    if (!force && (status === "loading" || status === "ready")) return get().user;

    if (!force && inflight) return inflight;

    set({ status: "loading", error: null });

    inflight = fetch("/api/auth/status", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        const user = mapAuthResponse(data);
        set({ user, status: "ready", error: null });
        return user;
      })
      .catch((error) => {
        set({ user: null, status: "ready", error });
        return null;
      })
      .finally(() => {
        inflight = null;
      });

    return inflight;
  },
}));

export default useUserStore;