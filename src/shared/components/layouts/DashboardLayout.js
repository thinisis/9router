"use client";

import { useState, useEffect } from "react";
import useUserStore from "@/store/userStore";
import { usePathname } from "next/navigation";
import Sidebar from "../Sidebar";
import Header from "../Header";
import CommandPalette from "../CommandPalette";
import GlassToastContainer from "../GlassToastContainer";
import { useReveal } from "@/shared/hooks/useReveal";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const fetchAuth = useUserStore((s) => s.fetchAuth);

  useEffect(() => {
    fetchAuth();
  }, [fetchAuth]);
  const contentRef = useReveal({ selector: "[data-reveal]", stagger: 0.04, y: 10 });

  return (
    <div className="dashboard-shell relative flex h-screen w-full overflow-hidden bg-background text-foreground">
      <CommandPalette />
      <div className="dashboard-bg" aria-hidden="true" />

      <GlassToastContainer />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="hidden lg:flex relative z-10">
        <Sidebar />
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:hidden transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div
          ref={contentRef}
          className={
            pathname === "/dashboard/basic-chat"
              ? "flex flex-1 min-h-0 flex-col overflow-hidden"
              : "flex-1 overflow-y-auto custom-scrollbar"
          }
        >
          <div
            data-page-content
            className={
              pathname === "/dashboard/basic-chat"
                ? "flex h-full min-h-0 w-full min-w-0 flex-1 flex-col"
                : "w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
            }
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}