import Link from "next/link";
import { auth } from "@/server/auth";
import styles from "./Header.module.css";

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
            {/* Add admin check here if needed */}
            <li>
              <Link href={`/profile/${session.user.id}`} className={styles.navLink}>
                Профиль
              </Link>
            </li>
            <li>
              <Link href="/api/auth/signout" className={styles.navLink}>
                Выход
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/api/auth/signin" className={styles.navLink}>
                Войти
              </Link>
            </li>
            {/*<li>*/}
            {/*  <Link href="/api/auth/signin" className={styles.navLink}>*/}
            {/*    Регистрация*/}
            {/*  </Link>*/}
            {/*</li>*/}
          </>
        )}
      </ul>
    </nav>
  );
}
