export function ProgressDial({
  value = 28,
  max = 35,
}: {
  value?: number;
  max?: number;
}) {
  const pct = value / max;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="var(--color-line)"
        strokeWidth="10"
      />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="10"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text
        x="70"
        y="78"
        textAnchor="middle"
        fontFamily="var(--font-spectral), serif"
        fontSize="34"
        fill="var(--color-ink)"
      >
        {Math.round(pct * 100)}
        <tspan fontSize="18" fill="var(--color-ink-3)">
          %
        </tspan>
      </text>
    </svg>
  );
}
