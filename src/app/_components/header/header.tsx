import Link from "next/link";
import { auth } from "@/server/auth";
import { HeaderNav } from "./header-nav";
import { MobileMenu } from "./mobile-menu";
import { AvatarMenu } from "./avatar-menu";
import { StreakBadge } from "./streak-badge";
import { ThemeToggle } from "./theme-toggle";
import { getInitials } from "@/app/_utils/user";

export async function Header() {
  const session = await auth();
  const loggedIn = !!session?.user;

  return (
    <header className="bg-bg border-line flex items-center justify-between gap-3 border-b px-5 py-[18px] sm:px-8 lg:px-14">
      <div className="flex items-center gap-4 lg:gap-9">
        <Link
          href="/"
          className="text-ink flex shrink-0 items-center gap-2.5 text-[16px] font-semibold tracking-[-0.02em] no-underline sm:text-[17px]"
        >
          <div className="bg-ink text-on-ink font-display grid h-[30px] w-[30px] place-items-center rounded-[9px] text-[19px] leading-none italic">
            A
          </div>
          ОГЭ Английский
        </Link>
        <HeaderNav />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        {session?.user ? (
          <>
            <div className="hidden sm:block">
              <StreakBadge />
            </div>
            <AvatarMenu
              initials={getInitials(session.user.name, session.user.email)}
              userId={session.user.id}
              isAdmin={session.user.role === "admin"}
            />
          </>
        ) : (
          <>
            <Link
              href="/api/auth/signin"
              className="rounded-pill border-line-2 text-ink bg-surface hover:bg-surface-2 hidden h-11 items-center justify-center border px-[22px] text-[15px] font-medium transition-colors sm:inline-flex"
            >
              Войти
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-pill bg-ink text-on-ink hover:bg-ink-hover hidden h-11 items-center justify-center px-[22px] text-[15px] font-medium transition-colors sm:inline-flex"
            >
              Регистрация
            </Link>
          </>
        )}
        <MobileMenu loggedIn={loggedIn} />
      </div>
    </header>
  );
}
