interface SectionHeadProps {
  index: string;
  en: string;
  title: string;
  subtitle: string;
}

export function SectionHead({ index, en, title, subtitle }: SectionHeadProps) {
  return (
    <div className="mb-6 grid grid-cols-[auto_1fr] items-start gap-[22px]">
      <div className="text-on-ink bg-ink font-display grid size-14 place-items-center rounded-[14px] text-[28px] tracking-[-0.02em] italic">
        {index}
      </div>
      <div>
        <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
          <span className="bg-accent h-1.5 w-1.5 rounded-full" />
          {en}
        </div>
        <h2 className="font-display mt-1.5 mb-0 text-[36px] tracking-[-0.025em]">
          {title}
        </h2>
        <div className="text-ink-3 mt-2 max-w-[560px] text-[14px] leading-relaxed">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-surface border-line mb-8 rounded-lg border px-10 py-9">
      {children}
    </section>
  );
}
