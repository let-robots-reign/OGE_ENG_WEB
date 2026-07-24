"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  IconHeadphones,
  IconBook,
  IconGrammar,
  IconPen,
} from "@/app/_components/home/icons";
import clsx from "clsx";

interface NavItem {
  label: string;
  href: string;
  activeMatch: (pathname: string, searchParams: URLSearchParams) => boolean;
  icon: React.ReactNode;
  disabled?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sections: NavSection[] = [
    {
      title: "История действий",
      items: [
        {
          label: "Тренировки",
          href: "/admin?tab=training",
          activeMatch: (path, params) =>
            path === "/admin" &&
            (params.get("tab") === "training" || !params.get("tab")),
          icon: (
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          ),
        },
        {
          label: "Диагностика",
          href: "/admin?tab=diagnostics",
          activeMatch: (path, params) =>
            (path === "/admin" && params.get("tab") === "diagnostics") ||
            path.startsWith("/admin/diagnostics"),
          icon: (
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Управление заданиями",
      items: [
        {
          label: "Аудирование",
          href: "/admin/tasks/audio",
          activeMatch: (path) => path.startsWith("/admin/tasks/audio"),
          icon: (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
              <IconHeadphones />
            </span>
          ),
        },
        {
          label: "Чтение",
          href: "/admin/tasks/reading",
          activeMatch: (path) => path.startsWith("/admin/tasks/reading"),
          icon: (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
              <IconBook />
            </span>
          ),
        },
        {
          label: "Языковой материал",
          href: "#",
          disabled: true,
          activeMatch: () => false,
          icon: (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center opacity-40 [&>svg]:h-5 [&>svg]:w-5">
              <IconGrammar />
            </span>
          ),
        },
        {
          label: "Письмо",
          href: "#",
          disabled: true,
          activeMatch: () => false,
          icon: (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center opacity-40 [&>svg]:h-5 [&>svg]:w-5">
              <IconPen />
            </span>
          ),
        },
      ],
    },
  ];

  return (
    <aside
      id="admin-sidebar"
      className={`bg-surface border-line fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r shadow-md transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Header / Toggle */}
      <div
        className={clsx(
          "border-line flex h-16 items-center justify-between border-b",
          collapsed ? "mx-auto" : "px-4",
        )}
      >
        {!collapsed && (
          <span className="font-display text-ink text-[15px] font-semibold tracking-tight">
            Разделы админки
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? "Развернуть меню" : "Свернуть меню"}
          className="border-line text-ink-3 hover:bg-surface-2 hover:text-ink ml-auto flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
        >
          <svg
            className={`h-4 w-4 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "mt-6" : ""}>
            {!collapsed && (
              <h3 className="text-ink-4 mb-2 px-3 text-[11px] font-semibold tracking-[0.1em] uppercase">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = item.activeMatch(pathname, searchParams);
                if (item.disabled) {
                  return (
                    <li key={item.label}>
                      <div
                        className={`text-ink-4 flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] opacity-50 ${
                          collapsed ? "justify-center" : ""
                        }`}
                        title={collapsed ? `${item.label} (скоро)` : undefined}
                      >
                        {item.icon}
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
                        isActive
                          ? "bg-ink text-on-ink"
                          : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      {item.icon}
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
