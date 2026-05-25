"use client";

import { useRouter } from "next/navigation";
import styles from "./BackButton.module.css";

export function BackButton() {
  const router = useRouter();

  return (
    <div className={styles.backButton} onClick={() => router.back()}>
      &lt;-
    </div>
  );
}
