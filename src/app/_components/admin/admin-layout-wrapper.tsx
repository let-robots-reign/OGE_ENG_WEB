"use client";

import { useEffect, useRef, useState } from "react";
import { AdminSidebar } from "./admin-sidebar";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved === "true") {
      setCollapsed(true);
    }
    setMounted(true);
  }, []);

  // Collapse sidebar when clicking outside of it if expanded
  useEffect(() => {
    if (collapsed) return;

    const handleClickOutside = (event: MouseEvent) => {
      const sidebarEl = document.getElementById("admin-sidebar");
      if (sidebarEl && !sidebarEl.contains(event.target as Node)) {
        setCollapsed(true);
        localStorage.setItem("admin_sidebar_collapsed", "true");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [collapsed]);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("admin_sidebar_collapsed", String(next));
  };

  if (!mounted) {
    return (
      <div className="bg-surface-subtle flex min-h-[calc(100vh-140px)] w-full">
        <aside className="bg-surface border-line fixed left-0 top-0 bottom-0 z-40 w-64 border-r" />
        <main className="flex-1 overflow-x-auto pl-64 p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-surface-subtle relative flex min-h-[calc(100vh-140px)] w-full">
      <AdminSidebar collapsed={collapsed} onToggle={handleToggle} />
      <main
        className={`flex-1 overflow-x-auto p-4 sm:p-6 lg:p-10 transition-all duration-300 ${
          collapsed ? "pl-[72px] sm:pl-20" : "pl-64 sm:pl-72"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
