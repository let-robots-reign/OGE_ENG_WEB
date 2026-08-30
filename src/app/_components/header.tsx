import Link from "next/link";
import { auth } from "@/server/auth";
import { SignOutButton } from "./SignOutButton";

const navLinkClass =
  "cursor-pointer border-0 bg-transparent p-2 text-[20px] text-ink no-underline transition-colors hover:text-ok";

export async function Header() {
  const session = await auth();

  return (
    <nav className="flex h-[75px] items-center justify-between border-b border-line bg-surface px-6 max-[670px]:h-auto max-[670px]:flex-col max-[670px]:py-2">
      <Link
        href="/"
        className="p-2 text-[28px] font-bold text-ink no-underline transition-colors hover:text-ok"
      >
        ОГЭ Английский
      </Link>

      <ul className="m-0 flex list-none items-center justify-center gap-4 p-0 max-[670px]:mt-3 max-[670px]:mb-5">
        {session?.user ? (
          <>
            {session.user.role === "admin" && (
              <li>
                <Link href="/admin" className={navLinkClass}>
                  Админка
                </Link>
              </li>
            )}
            <li>
              <Link
                href={`/profile/${session.user.id}`}
                className={navLinkClass}
              >
                Профиль
              </Link>
            </li>
            <li>
              <SignOutButton />
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/api/auth/signin" className={navLinkClass}>
                Войти
              </Link>
            </li>
            <li>
              <Link href="/auth/signup" className={navLinkClass}>
                Регистрация
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
