"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavActive } from "./nav-items";

interface MobileMenuProps {
  loggedIn: boolean;
}

export function MobileMenu({ loggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close whenever the route changes (e.g. after tapping a link).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Меню"
        aria-expanded={open}
        className="border-line-2 bg-surface text-ink-2 hover:bg-surface-2 grid h-10 w-10 place-items-center rounded-full border transition-colors"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M6 6l12 12M6 18L18 6" />
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div className="border-line bg-surface absolute top-12 right-0 z-50 w-56 rounded-md border p-1.5 shadow-lg">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
              className={[
                "block rounded-sm px-3.5 py-2.5 text-[15px] font-medium transition-colors",
                isNavActive(item.id, pathname)
                  ? "bg-ink text-on-ink"
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}

          {!loggedIn && (
            <>
              <div className="border-line my-1.5 border-t" />
              <Link
                href="/api/auth/signin"
                onClick={() => setOpen(false)}
                className="text-ink-2 hover:bg-surface-2 hover:text-ink block rounded-sm px-3.5 py-2.5 text-[15px] font-medium transition-colors"
              >
                Войти
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="bg-ink text-on-ink hover:bg-ink-hover rounded-pill mt-1 block px-3.5 py-2.5 text-center text-[15px] font-medium transition-colors"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
