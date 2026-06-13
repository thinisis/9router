"use client";

import { useEffect } from "react";
import useUserStore from "@/store/userStore";

export function useDashboardAuth() {
  const user = useUserStore((s) => s.user);
  const status = useUserStore((s) => s.status);
  const fetchAuth = useUserStore((s) => s.fetchAuth);

  useEffect(() => {
    fetchAuth();
  }, [fetchAuth]);

  return {
    user,
    isLoading: status === "loading" || status === "idle",
    isReady: status === "ready",
  };
}