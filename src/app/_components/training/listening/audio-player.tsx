"use client";

import { useMemo, useRef, useState } from "react";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const BAR_COUNT = 80;
const AUDIO_SPEED_OPTIONS = [0.5, 0.75, 1, 1.25] as const;

interface AudioPlayerProps {
  src: string;
  label?: string;
}

export function AudioPlayer({ src, label = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rateIdx, setRateIdx] = useState(2);
  const [showRateMenu, setShowRateMenu] = useState(false);

  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => {
        const seed = (Math.sin(i * 0.7) + Math.sin(i * 0.21) + 2) / 4;
        return Math.max(0.12, seed);
      }),
    [],
  );

  const progress = duration > 0 ? currentTime / duration : 0;
  const playhead = Math.floor(progress * BAR_COUNT);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  const restart = () => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    setCurrentTime(0);
  };

  const cycleRate = () => {
    const next = (rateIdx + 1) % AUDIO_SPEED_OPTIONS.length;
    setRateIdx(next);
    if (audioRef.current)
      audioRef.current.playbackRate = AUDIO_SPEED_OPTIONS[next]!;
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width),
    );
    el.currentTime = fraction * duration;
    setCurrentTime(fraction * duration);
  };

  return (
    <div
      className="border-line grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border p-4 sm:gap-7 sm:p-7"
      style={{
        background:
          "linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-2) 100%)",
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Пауза" : "Воспроизвести"}
        className="text-on-ink grid cursor-pointer place-items-center rounded-full border-0"
        style={{
          width: 64,
          height: 64,
          background: "var(--color-ink)",
          boxShadow: "0 8px 22px rgba(10,23,51,0.18)",
        }}
      >
        {playing ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 4.5v15a1 1 0 0 0 1.55.83l11.5-7.5a1 1 0 0 0 0-1.66L8.55 3.67A1 1 0 0 0 7 4.5z" />
          </svg>
        )}
      </button>

      <div className="min-w-0">
        <div className="mb-2.5 flex items-baseline justify-between">
          <div className="text-[15.5px] font-medium">{label}</div>
          <div className="text-ink-3 font-mono text-[13px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        <div
          className="flex min-w-0 cursor-pointer items-center gap-0.5 overflow-hidden"
          style={{ height: 36 }}
          onClick={seek}
        >
          {bars.map((b, i) => (
            <div
              key={i}
              className="flex-1 rounded-[1.5px]"
              style={{
                height: `${b * 100}%`,
                background:
                  i < playhead ? "var(--color-accent)" : "var(--color-line-2)",
                transition: "background 0.12s",
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={restart}
          className="rounded-pill border-line-2 inline-flex cursor-pointer items-center justify-center gap-2 border text-[14px] font-medium"
          style={{ height: 36, padding: "0 12px" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          Сначала
        </button>
        <div
          className="relative"
          onMouseEnter={() => setShowRateMenu(true)}
          onMouseLeave={() => setShowRateMenu(false)}
        >
          {showRateMenu && (
            <div
              className="absolute bottom-full left-0 z-10 pb-1.5"
              style={{ minWidth: "100%" }}
            >
              <div
                className="flex flex-col gap-0.5"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 10,
                  padding: 4,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                }}
              >
                {AUDIO_SPEED_OPTIONS.map((rate, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRateIdx(idx);
                      if (audioRef.current)
                        audioRef.current.playbackRate = rate;
                    }}
                    className="rounded-pill inline-flex cursor-pointer items-center justify-center font-mono text-[13px] font-medium"
                    style={{
                      height: 30,
                      padding: "0 10px",
                      background:
                        idx === rateIdx ? "var(--color-ink)" : "transparent",
                      color:
                        idx === rateIdx
                          ? "var(--color-on-ink)"
                          : "var(--color-ink)",
                    }}
                  >
                    {rate}×
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={cycleRate}
            className="rounded-pill border-line-2 inline-flex w-full cursor-pointer items-center justify-center border font-mono text-[14px] font-medium"
            style={{ height: 36, padding: "0 12px" }}
          >
            {AUDIO_SPEED_OPTIONS[rateIdx]}×
          </button>
        </div>
      </div>
    </div>
  );
}
