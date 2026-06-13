"use client";

import { Skeleton } from "./Loading";

function DashboardShellSkeleton() {
  return (
    <div className="app-shell-skeleton" aria-busy="true" aria-label="Loading interface">
      <div className="app-shell-skeleton-bg" aria-hidden="true" />
      <div className="app-shell-skeleton-layout">
        <aside className="app-shell-skeleton-sidebar hidden lg:flex w-72 shrink-0" aria-hidden="true">
          <div className="flex items-center gap-3 px-5 pt-6 pb-4">
            <Skeleton className="size-10 rounded-2xl skeleton-shimmer" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-24 skeleton-shimmer" />
              <Skeleton className="h-2.5 w-12 skeleton-shimmer" />
            </div>
          </div>
          <div className="flex flex-col gap-2 px-3 flex-1">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-xl skeleton-shimmer" />
            ))}
          </div>
        </aside>

        <main className="app-shell-skeleton-main">
          <header className="app-shell-skeleton-header glass-navbar">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="size-8 rounded-xl lg:hidden skeleton-shimmer" />
              <Skeleton className="size-8 rounded-[10px] skeleton-shimmer" />
              <Skeleton className="h-5 w-32 max-w-[40vw] skeleton-shimmer" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-36 hidden sm:block rounded-xl skeleton-shimmer" />
              <Skeleton className="size-8 rounded-full skeleton-shimmer" />
            </div>
          </header>

          <div className="app-shell-skeleton-content">
            <Skeleton className="h-10 w-full max-w-md rounded-[14px] skeleton-shimmer mb-6" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-36 w-full rounded-2xl skeleton-shimmer" />
              <Skeleton className="h-36 w-full rounded-2xl skeleton-shimmer" />
              <Skeleton className="h-28 w-full rounded-2xl skeleton-shimmer hidden sm:block" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function MinimalShellSkeleton() {
  return (
    <div className="app-shell-skeleton app-shell-skeleton--minimal" aria-busy="true" aria-label="Loading">
      <div className="app-shell-skeleton-bg" aria-hidden="true" />
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
        <Skeleton className="size-14 rounded-2xl skeleton-shimmer" />
        <Skeleton className="h-10 w-full max-w-sm rounded-2xl skeleton-shimmer" />
        <Skeleton className="h-10 w-full max-w-sm rounded-2xl skeleton-shimmer" />
        <Skeleton className="h-11 w-full max-w-sm rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}

export default function AppShellSkeleton({ variant = "dashboard" }) {
  if (variant === "minimal") return <MinimalShellSkeleton />;
  return <DashboardShellSkeleton />;
}