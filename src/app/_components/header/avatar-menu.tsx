"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import posthog from "posthog-js";
import { api } from "@/trpc/react";
import { getInitials } from "@/app/_utils/user";

interface AvatarMenuProps {
  /** Server-computed initials used as an optimistic value until the live query resolves. */
  initials: string;
  userId: string;
  isAdmin: boolean;
}

export function AvatarMenu({ initials, userId, isAdmin }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Source of truth for displayed identity: a cached query, not the JWT/session.
  // Mutations (e.g. profile edits) invalidate this and the avatar updates instantly.
  const { data: profile } = api.user.getProfileHeader.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const displayInitials = profile
    ? getInitials(profile.name, profile.email)
    : initials;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSignOut = () => {
    posthog.capture("user_signed_out");
    posthog.reset();
    void signOut({ redirectTo: "/" });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="to-accent grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-gradient-to-br from-[#c8c4ff] text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        aria-label="Меню пользователя"
      >
        {displayInitials}
      </button>

      {open && (
        <div className="bg-surface border-line absolute top-11 right-0 z-50 w-44 rounded-md border py-1 shadow-md">
          <Link
            href={`/profile/${userId}`}
            onClick={() => setOpen(false)}
            className="text-ink-2 hover:bg-surface-2 hover:text-ink block px-4 py-2 text-sm transition-colors"
          >
            Профиль
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="text-ink-2 hover:bg-surface-2 hover:text-ink block px-4 py-2 text-sm transition-colors"
            >
              Админка
            </Link>
          )}
          <div className="border-line my-1 border-t" />
          <button
            onClick={handleSignOut}
            className="text-ink-2 hover:bg-surface-2 hover:text-ink w-full px-4 py-2 text-left text-sm transition-colors"
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
