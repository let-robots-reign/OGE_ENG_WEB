interface ProgressDotsProps {
  total: number;
  answered: number[];
}

export function ProgressDots({ total, answered }: ProgressDotsProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const isDone = answered.includes(i + 1);
        return (
          <div
            key={i}
            style={{
              width: 28,
              height: 6,
              borderRadius: 3,
              background: isDone
                ? "var(--color-accent)"
                : "var(--color-line-2)",
            }}
          />
        );
      })}
    </div>
  );
}
