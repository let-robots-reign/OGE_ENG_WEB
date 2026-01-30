"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

type ModalProps = {
  title?: string;
  size?: "small" | "medium" | "large";
  onClose: () => void;
  children: ReactNode;
};

export function Modal({
  title,
  size = "small",
  onClose,
  children,
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return createPortal(
    <>
      <div className={styles.modalBackdrop} onClick={onClose} />
      <div className={`${styles.modal} ${styles[`modal_size_${size}`]}`}>
        {title && <h3 className={styles.modal__title}>{title}</h3>}
        <div className={styles.modal__content}>{children}</div>
      </div>
    </>,
    document.body
  );
}
