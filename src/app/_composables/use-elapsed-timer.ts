"use client";

import { useCallback, useEffect, useState } from "react";

export function useElapsedTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const reset = useCallback(() => setSeconds(0), []);

  return { seconds, reset };
}
