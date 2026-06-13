"use client";

import Link from "next/link";

export default function CreditsNotice({ compact = false }) {
  if (compact) {
    return (
      <p className="text-[10px] leading-relaxed text-text-subtle">
        Based on{" "}
        <Link
          href="https://github.com/decolua/9router"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted hover:text-accent transition-colors"
        >
          9Router
        </Link>{" "}
        by decolua ·{" "}
        <Link
          href="https://opensource.org/licenses/MIT"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted hover:text-accent transition-colors"
        >
          MIT License
        </Link>
      </p>
    );
  }

  return (
    <div className="glass-panel-subtle px-4 py-3">
      <p className="text-xs text-text-muted leading-relaxed">
        This interface is built on{" "}
        <Link
          href="https://github.com/decolua/9router"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          9Router
        </Link>{" "}
        (Copyright © 2024–2026 decolua and contributors), licensed under the{" "}
        <Link
          href="https://opensource.org/licenses/MIT"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          MIT License
        </Link>
        .
      </p>
    </div>
  );
}