interface SampleChipProps {
  sample: { from: string; to: string } | string | null;
  dark?: boolean;
}

export function SampleChip({ sample, dark = false }: SampleChipProps) {
  if (!sample) return null;

  if (typeof sample === "string") {
    return (
      <div
        className={`rounded-pill border px-3.5 py-2 font-mono text-[12px] tracking-[0.06em] uppercase ${
          dark
            ? "border-white/12 bg-white/8 text-white/70"
            : "border-line bg-surface-2 text-ink-2"
        }`}
      >
        {sample}
      </div>
    );
  }

  return (
    <div
      className={`rounded-pill inline-flex items-center gap-2.5 border py-2 pr-3.5 pl-2 ${
        dark ? "border-white/12 bg-white/6" : "border-line bg-surface-2"
      }`}
    >
      <span
        className={`rounded-pill px-2 py-[3px] font-mono text-[11.5px] tracking-[0.08em] ${
          dark ? "bg-white/10 text-white/85" : "bg-surface text-ink-2"
        }`}
      >
        {sample.from}
      </span>
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke={dark ? "rgba(255,255,255,0.5)" : "var(--color-ink-3)"}
        strokeWidth="2"
      >
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
      <span
        className={`font-display text-[17px] italic ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {sample.to}
      </span>
    </div>
  );
}
