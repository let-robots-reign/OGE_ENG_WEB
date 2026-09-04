"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "ready" | "first" | "gap" | "second" | "done" | "error";

const statusLabel = (phase: Phase, seconds: number) => {
  if (phase === "ready") return "Готово к прослушиванию";
  if (phase === "first") return "Прослушивание 1 из 2";
  if (phase === "gap") return `Повтор через ${seconds} сек.`;
  if (phase === "second") return "Прослушивание 2 из 2";
  if (phase === "done") return "Прослушивания завершены";
  return "Не удалось воспроизвести запись";
};

export function ExamAudioPlayer({
  src,
  onPlaybackStateChange,
}: {
  src: string;
  onPlaybackStateChange?: (isBusy: boolean) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [failedPlayback, setFailedPlayback] = useState<"first" | "second">(
    "first",
  );
  const [gapSeconds, setGapSeconds] = useState(5);

  const play = async (nextPhase: "first" | "second") => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      audio.playbackRate = 1;
      setPhase(nextPhase);
      await audio.play();
    } catch {
      setFailedPlayback(nextPhase);
      setPhase("error");
    }
  };

  const isBusy = phase === "first" || phase === "gap" || phase === "second";

  useEffect(() => {
    onPlaybackStateChange?.(isBusy);
  }, [isBusy, onPlaybackStateChange]);

  useEffect(
    () => () => {
      onPlaybackStateChange?.(false);
    },
    [onPlaybackStateChange],
  );

  useEffect(() => {
    if (phase !== "gap") return;
    let remaining = 5;
    setGapSeconds(remaining);
    const interval = window.setInterval(() => {
      remaining -= 1;
      setGapSeconds(Math.max(0, remaining));
      if (remaining <= 0) {
        window.clearInterval(interval);
        void play("second");
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  const actionLabel =
    phase === "error"
      ? failedPlayback === "second"
        ? "Повторить второе прослушивание"
        : "Повторить первое прослушивание"
      : "Начать первое прослушивание";

  return (
    <div className="border-line bg-surface mb-7 flex items-center gap-4 rounded-lg border p-5">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onEnded={() => {
          if (phase === "first") setPhase("gap");
          if (phase === "second") setPhase("done");
        }}
        onError={() => {
          if (phase === "first" || phase === "second") {
            setFailedPlayback(phase);
          }
          setPhase("error");
        }}
      />
      <button
        type="button"
        onClick={() => void play(phase === "error" ? failedPlayback : "first")}
        disabled={phase !== "ready" && phase !== "error"}
        className="bg-ink text-on-ink grid size-14 shrink-0 place-items-center rounded-full disabled:cursor-default disabled:opacity-50"
        aria-label={actionLabel}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 4.5v15a1 1 0 0 0 1.55.83l11.5-7.5a1 1 0 0 0 0-1.66L8.55 3.67A1 1 0 0 0 7 4.5z" />
        </svg>
      </button>
      <div className="min-w-0 flex-1" aria-live="polite">
        <div className="font-display text-[21px]">
          {statusLabel(phase, gapSeconds)}
        </div>
        <div className="text-ink-3 mt-1 text-[13px]">
          Запись прозвучит два раза. Пауза, перемотка и изменение скорости
          недоступны.
        </div>
      </div>
      <div className="bg-surface-2 rounded-pill px-3 py-1.5 font-mono text-[12px]">
        {phase === "ready" || (phase === "error" && failedPlayback === "first")
          ? "0 / 2"
          : phase === "first" || phase === "gap" || phase === "error"
            ? "1 / 2"
            : "2 / 2"}
      </div>
    </div>
  );
}
