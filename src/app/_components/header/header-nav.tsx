"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavActive } from "./nav-items";

export function HeaderNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden gap-1 md:flex">
      {NAV_ITEMS.map((item) => (
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
