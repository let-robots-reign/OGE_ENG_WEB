import { READING_GENRES } from "./data";

export function GenreStrip() {
  return (
    <div className="mt-14">
      <div className="mb-[18px] flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
            что встречается в текстах
          </div>
          <div className="font-display mt-1.5 text-[26px] tracking-[-0.02em] sm:text-[32px]">
            Жанры и темы раздела
          </div>
        </div>
        <div className="text-ink-3 font-mono text-[12px] tracking-[0.06em]">
          по материалам ОГЭ 2022–2026
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {READING_GENRES.map((item) => (
          <div
            key={item.tag}
            className="bg-surface border-line flex flex-col gap-2.5 rounded-lg border p-[22px]"
          >
            <div
              className="rounded-pill inline-flex items-center self-start px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] uppercase"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-ink-3)",
              }}
            >
              {item.tag}
            </div>
            <div className="font-display text-[22px] tracking-[-0.01em] italic">
              {item.title}
            </div>
            <p className="text-ink-3 text-[13px] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
