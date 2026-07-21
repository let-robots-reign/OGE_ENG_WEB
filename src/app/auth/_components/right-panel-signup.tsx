const FEATURES = [
  {
    num: "01",
    t: "Грамматическая диагностика",
    d: "24 коротких вопроса для оценки уровня.",
  },
  {
    num: "02",
    t: "Тренировки и теория",
    d: "Безлимитные тренировки по письменным разделам и полезная теория",
  },
  {
    num: "03",
    t: "Реальные варианты ОГЭ (ФИПИ)",
    d: "Симуляция экзамена с таймером",
  },
];

const AVATARS = [
  { label: "М", bg: "#c8c4ff" },
  { label: "А", bg: "#ffb89e" },
  { label: "К", bg: "#9eecc4" },
  { label: "Д", bg: "#ffd7b8" },
];

export function RightPanelSignUp() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0a1733] p-12 text-white lg:flex">
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top */}
      <div className="relative">
        <div className="inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] text-white/55 uppercase">
          <span className="bg-accent-2 h-1.5 w-1.5 rounded-full" />
          что вы получаете
        </div>
        <div className="font-display mt-4 text-[44px] leading-none tracking-[-0.025em] text-white xl:text-[62px]">
          Личный план до&nbsp;экзамена за&nbsp;12&nbsp;минут.
        </div>
      </div>

      {/* Feature list */}
      <div className="relative flex max-w-[480px] flex-col gap-0">
        {FEATURES.map((f) => (
          <div
            key={f.num}
            className="grid items-center gap-[18px] py-4"
            style={{
              gridTemplateColumns: "auto 1fr",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="rounded-md px-2.5 py-1.5 font-mono text-[12px] tracking-[0.05em] text-white/40"
              style={{ border: "1px solid rgba(255,255,255,0.12)" }}
            >
              {f.num}
            </div>
            <div>
              <div className="text-[16px] font-medium">{f.t}</div>
              <div className="mt-1 text-[13.5px] text-white/55">{f.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom — social proof */}
      <div
        className="relative flex items-center justify-between pt-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="text-[13px] text-white/55">
          Уже занимаются 1&nbsp;500+ девятиклассников
        </div>
        <div className="ml-3 flex">
          {AVATARS.map((a, i) => (
            <div
              key={i}
              className="text-ink grid h-[30px] w-[30px] place-items-center rounded-full text-[12px] font-semibold"
              style={{
                background: a.bg,
                marginLeft: i === 0 ? 0 : -8,
                border: "2px solid #0a1733",
              }}
            >
              {a.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
