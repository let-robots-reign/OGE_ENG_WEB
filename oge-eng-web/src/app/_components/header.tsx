import Link from "next/link";
import { auth } from "@/server/auth";
import styles from "./Header.module.css";
import { SignOutButton } from "./SignOutButton";

export async function Header() {
  const session = await auth();

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.navbarLogo}>
        ОГЭ Английский
      </Link>

      <ul className={styles.navbarMenu}>
        {session?.user ? (
          <>
            {session.user.role === "admin" && (
              <li>
                <Link href="/admin" className={styles.navLink}>
                  Админка
                </Link>
              </li>
            )}
            <li>
              <Link
                href={`/profile/${session.user.id}`}
                className={styles.navLink}
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
              <Link href="/api/auth/signin" className={styles.navLink}>
                Войти
              </Link>
            </li>
            <li>
              <Link href="/auth/signup" className={styles.navLink}>
                Регистрация
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
