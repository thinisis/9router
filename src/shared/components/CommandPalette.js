"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import Input from "./Input";
import { cn } from "@/shared/utils/cn";
import { COMMAND_ROUTES } from "@/shared/constants/commandPalette";

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [providers, setProviders] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((d) => setProviders(d.connections || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActiveIndex(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const providerItems = useMemo(() => {
    const seen = new Set();
    return providers
      .filter((c) => {
        const key = c.provider;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((c) => ({
        id: `provider-${c.provider}`,
        label: c.name || c.provider,
        href: `/dashboard/providers/${c.provider}`,
        icon: "dns",
        keywords: `${c.provider} ${c.name || ""} provider`,
      }));
  }, [providers]);

  const items = useMemo(() => {
    const all = [...COMMAND_ROUTES, ...providerItems];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords?.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q)
    );
  }, [query, providerItems]);

  const navigate = useCallback(
    (href) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && items[activeIndex]) {
        e.preventDefault();
        navigate(items[activeIndex].href);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, items, activeIndex, navigate]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Command palette"
      size="lg"
      className="!max-w-lg"
      closeOnOverlay
    >
      <div className="flex flex-col gap-3 -mt-1" data-i18n-skip="true">
        <Input
          icon="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages, providers…"
          autoFocus
          inputClassName="h-10"
        />
        <ul className="max-h-[min(50vh,360px)] overflow-y-auto custom-scrollbar -mx-1">
          {items.length === 0 ? (
            <li className="px-3 py-6 text-sm text-text-muted text-center">No results</li>
          ) : (
            items.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm rounded-xl transition-colors",
                    index === activeIndex
                      ? "bg-brand-500/10 text-text-main"
                      : "text-text-muted hover:bg-surface-2 hover:text-text-main"
                  )}
                >
                  <span className="material-symbols-outlined text-[18px] shrink-0">{item.icon}</span>
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="flex gap-3 text-[10px] text-text-muted pt-1 border-t border-border-subtle">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border-subtle">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border-subtle">K</kbd>
            toggle
          </span>
          <kbd className="ml-auto hidden sm:inline-flex px-1.5 py-0.5 rounded bg-surface-2 border border-border-subtle">Esc</kbd>
        </div>
      </div>
    </Modal>
  );
}