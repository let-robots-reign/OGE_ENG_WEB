interface SampleChipProps {
  sample: { from: string; to: string } | string | null;
  dark?: boolean;
}

export function SampleChip({ sample, dark = false }: SampleChipProps) {
  if (!sample) return null;

  if (typeof sample === "string") {
    return (
      <div
        className="rounded-pill px-3.5 py-2 font-mono text-[12px] tracking-[0.06em] uppercase"
        style={{
          background: dark
            ? "rgba(255,255,255,0.08)"
            : "var(--color-surface-2)",
          color: dark ? "rgba(255,255,255,0.7)" : "var(--color-ink-2)",
          border: dark
            ? "1px solid rgba(255,255,255,0.12)"
            : "1px solid var(--color-line)",
        }}
      >
        {sample}
      </div>
    );
  }

  return (
    <div
      className="rounded-pill inline-flex items-center gap-2.5 py-2 pr-3.5 pl-2"
      style={{
        background: dark ? "rgba(255,255,255,0.06)" : "var(--color-surface-2)",
        border: dark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid var(--color-line)",
      }}
    >
      <span
        className="rounded-pill px-2 py-[3px] font-mono text-[11.5px] tracking-[0.08em]"
        style={{
          background: dark ? "rgba(255,255,255,0.1)" : "var(--color-surface)",
          color: dark ? "rgba(255,255,255,0.85)" : "var(--color-ink-2)",
        }}
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
        className="font-display text-[17px] italic"
        style={{ color: dark ? "#fff" : "var(--color-ink)" }}
      >
        {sample.to}
      </span>
    </div>
  );
}
