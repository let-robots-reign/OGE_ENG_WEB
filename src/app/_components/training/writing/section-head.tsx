interface SectionHeadProps {
  index: string;
  en: string;
  title: string;
  subtitle: string;
}

export function SectionHead({ index, en, title, subtitle }: SectionHeadProps) {
  return (
    <div
      className="mb-6 grid items-start"
      style={{ gridTemplateColumns: "auto 1fr", gap: 22 }}
    >
      <div
        className="text-on-ink font-display grid place-items-center italic"
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "var(--color-ink)",
          fontSize: 28,
          letterSpacing: "-0.02em",
        }}
      >
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
    <section
      className="bg-surface border-line mb-8 rounded-lg border"
      style={{ padding: "36px 40px" }}
    >
      {children}
    </section>
  );
}
