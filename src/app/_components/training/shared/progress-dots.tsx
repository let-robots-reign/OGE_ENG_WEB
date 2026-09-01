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
            className={`h-1.5 w-7 rounded-[3px] ${
              isDone ? "bg-accent" : "bg-line-2"
            }`}
          />
        );
      })}
    </div>
  );
}
