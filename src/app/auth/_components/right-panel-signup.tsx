const FEATURES = [
  {
    num: "01",
    t: "Тренировки и теория",
    d: "Безлимитные тренировки по письменным разделам и полезная теория",
  },
  {
    num: "02",
    t: "Пробные варианты ОГЭ (ФИПИ)",
    d: "Симуляция письменной части экзамена с таймером",
  },
  {
    num: "03",
    t: "Грамматическая диагностика",
    d: "24 коротких вопроса для оценки уровня.",
  },
  {
    num: "04",
    t: "Мониторинг класса",
    d: "Для учителей - отслеживание прогресса класса",
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
          {/* Личный план до&nbsp;экзамена за&nbsp;12&nbsp;минут. */}
          Безлимитный и бесплатный тренажер для подготовки к ОГЭ
        </div>
      </div>

      {/* Feature list */}
      <div className="relative flex max-w-[480px] flex-col gap-0">
        {FEATURES.map((f) => (
          <div
            key={f.num}
            className="grid grid-cols-[auto_1fr] items-center gap-[18px] border-t border-white/8 py-4"
          >
            <div className="rounded-md border border-white/12 px-2.5 py-1.5 font-mono text-[12px] tracking-[0.05em] text-white/40">
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
      <div className="relative flex items-center justify-between border-t border-white/10 pt-6">
        <div className="text-[13px] text-white/55">
          Уже занимаются 150+ девятиклассников
        </div>
        <div className="ml-3 flex">
          {AVATARS.map((a, i) => (
            <div
              key={i}
              className={`grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-[#0a1733] text-[12px] font-semibold text-[#0a1733] ${
                i === 0 ? "ml-0" : "-ml-2"
              }`}
              style={{
                background: a.bg,
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
