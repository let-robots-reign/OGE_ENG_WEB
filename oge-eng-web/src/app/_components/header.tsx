"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import styles from "./Header.module.css";
import { useState } from "react";
import { Modal } from "./Modal";

export function Header() {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);

  const handleSignOut = () => {
    void signOut({ redirectTo: "/" });
  };

  return (
    <>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navbarLogo}>
          ОГЭ Английский
        </Link>

        <ul className={styles.navbarMenu}>
          {session?.user ? (
            <>
              <li>
                <Link
                  href={`/profile/${session.user.id}`}
                  className={styles.navLink}
                >
                  Профиль
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setShowModal(true)}
                  className={styles.navLink}
                >
                  Выход
                </button>
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
      {showModal && (
        <Modal
          title="Вы уверены, что хотите выйти?"
          onClose={() => setShowModal(false)}
        >
          <div className={styles.modalActions}>
            <button
              onClick={handleSignOut}
              className={`${styles.btn} ${styles.primary}`}
            >
              Да
            </button>
            <button
              onClick={() => setShowModal(false)}
              className={`${styles.btn} ${styles.secondary}`}
            >
              Отменить
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
