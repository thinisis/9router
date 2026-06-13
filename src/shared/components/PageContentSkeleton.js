"use client";

import { CardSkeleton } from "./Loading";

export default function PageContentSkeleton({ rows = 2 }) {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}