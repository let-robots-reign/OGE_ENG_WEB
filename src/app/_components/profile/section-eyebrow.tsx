export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
      <span className="bg-accent h-1.5 w-1.5 rounded-full" />
      {children}
    </div>
  );
}
