"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdownTimer(initialSeconds: number, running: boolean) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [resetVersion, setResetVersion] = useState(0);
  const remainingRef = useRef(initialSeconds);
  const deadlineRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;

    const deadline = Date.now() + remainingRef.current * 1000;
    deadlineRef.current = deadline;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      remainingRef.current = remaining;
      setSecondsLeft(remaining);
      if (remaining === 0) clearInterval(id);
    };

    const id = setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", update);
      if (deadlineRef.current === deadline) {
        remainingRef.current = Math.max(
          0,
          Math.ceil((deadline - Date.now()) / 1000),
        );
        deadlineRef.current = null;
      }
    };
  }, [resetVersion, running]);

  const reset = useCallback(() => {
    deadlineRef.current = null;
    remainingRef.current = initialSeconds;
    setSecondsLeft(initialSeconds);
    setResetVersion((version) => version + 1);
  }, [initialSeconds]);

  return {
    secondsLeft,
    isExpired: secondsLeft === 0,
    isWarning: secondsLeft <= 60 && secondsLeft > 0,
    reset,
  };
}
