interface InfoCardProps {
  tag: string;
  title: string;
  body: string;
}

export function InfoCard({ tag, title, body }: InfoCardProps) {
  return (
    <div className="bg-surface border-line rounded-lg border p-6">
      <div className="rounded-pill bg-surface-2 text-ink-3 inline-flex items-center px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] uppercase">
        {tag}
      </div>
      <div className="font-display mt-3 text-[24px] tracking-[-0.02em]">
        {title}
      </div>
      <p className="text-ink-3 mt-2 text-[14px] leading-relaxed">{body}</p>
    </div>
  );
}
