"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, navItemsForRole } from "./nav-items";

export function HeaderNav({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const items = navItemsForRole(role);
  return (
    <nav className="hidden gap-1 md:flex">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={[
            "rounded-pill px-[14px] py-2 text-[14.5px] font-medium transition-colors",
            isNavActive(item.id, pathname)
              ? "bg-ink text-on-ink"
              : "text-ink-2 hover:bg-surface-2 hover:text-ink",
          ].join(" ")}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
