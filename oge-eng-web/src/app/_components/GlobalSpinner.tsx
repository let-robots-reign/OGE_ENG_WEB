"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import styles from "./GlobalSpinner.module.css";

export function GlobalSpinner() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isVisible = isFetching > 0 || isMutating > 0;

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
    </div>
  );
}