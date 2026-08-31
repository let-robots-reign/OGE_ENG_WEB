import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCountdownTimer } from "@/app/_composables/use-countdown-timer";

describe("useCountdownTimer", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("uses one interval for the full countdown", async () => {
    vi.useFakeTimers();
    const intervalSpy = vi.spyOn(globalThis, "setInterval");
    const { result } = renderHook(() => useCountdownTimer(3, true));

    await act(() => vi.advanceTimersByTime(3000));

    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isExpired).toBe(true);
    expect(intervalSpy).toHaveBeenCalledTimes(1);
  });

  it("uses the wall clock after browser timer throttling", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T00:00:00Z"));
    const { result } = renderHook(() => useCountdownTimer(120, true));

    await act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(119);

    act(() => {
      vi.setSystemTime(new Date("2026-08-09T00:01:01Z"));
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.secondsLeft).toBe(59);
  });

  it("starts a new deadline when reset", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCountdownTimer(3, true));

    await act(() => vi.advanceTimersByTime(3000));
    expect(result.current.secondsLeft).toBe(0);

    act(() => result.current.reset());
    await act(() => vi.advanceTimersByTime(1000));

    expect(result.current.secondsLeft).toBe(2);
  });
});
