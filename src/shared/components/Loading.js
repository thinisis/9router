"use client";

import { Skeleton as HeroSkeleton, Spinner as HeroSpinner } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

export function Spinner({ size = "md", className }) {
  const sizes = {
    sm: "sm",
    md: "md",
    lg: "lg",
    xl: "lg",
  };

  return (
    <HeroSpinner
      size={sizes[size] || "md"}
      color="accent"
      className={className}
    />
  );
}

export function PageLoading({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <Spinner size="xl" />
      <p className="mt-4 text-default-500">{message}</p>
    </div>
  );
}

export function Skeleton({ className, ...props }) {
  return (
    <HeroSkeleton
      className={cn("rounded-xl skeleton-shimmer", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-divider bg-content1 shadow-sm skeleton-shimmer-block">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export default function Loading({ type = "spinner", ...props }) {
  switch (type) {
    case "page":
      return <PageLoading {...props} />;
    case "skeleton":
      return <Skeleton {...props} />;
    case "card":
      return <CardSkeleton {...props} />;
    default:
      return <Spinner {...props} />;
  }
}