"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Modal } from "./Modal";
import styles from "./Header.module.css";

export function SignOutButton() {
  const [showModal, setShowModal] = useState(false);

  const handleSignOut = () => {
    void signOut({ redirectTo: "/" });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className={styles.navLink}>
        Выход
      </button>
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
