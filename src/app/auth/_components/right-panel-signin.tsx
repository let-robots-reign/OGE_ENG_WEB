import { getExamCountdownText, EXAM_NAME } from "@/app/_utils/exam";

const BAR_HEIGHTS = [0.42, 0.55, 0.5, 0.68, 0.74, 0.7, 0.82];
const BAR_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function RightPanelSignIn() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0a1733] p-10 text-white lg:flex">
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
      <div
        className="rounded-pill inline-flex w-fit items-center gap-2.5 px-4 py-2 font-mono text-[12.5px] tracking-[0.05em]"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <span className="bg-accent-2 h-1.5 w-1.5 rounded-full" />
        {EXAM_NAME} · {getExamCountdownText()}
      </div>

      {/* Center */}
      <div className="relative max-w-[560px]">
        <div className="font-display text-[52px] leading-none tracking-[-0.025em] text-white xl:text-[68px]">
          Готовимся к ОГЭ просто и
          <br />
          <span className="text-ink-4 italic">эффективно.</span>
        </div>
        <div className="mt-7 max-w-[480px] text-[16px] leading-[1.55] text-white/65">
          Тренировки по аудированию, чтению, грамматике и письму — построенные
          точно по&nbsp;структуре экзамена ФИПИ.
        </div>

        {/* Progress mini-chart */}
        <div
          className="mt-10 max-w-[360px] rounded-lg p-6"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="mb-4 flex justify-between font-mono text-[12.5px] tracking-[0.05em] text-white/55 uppercase">
            <span>прогресс на этой неделе</span>
            <span>+12%</span>
          </div>
          <div className="mb-3 flex h-[72px] items-end gap-1.5">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-[4px]"
                style={{
                  height: `${h * 100}%`,
                  background: i === 6 ? "#ff5b3a" : "rgba(255,255,255,0.18)",
                }}
              />
            ))}
          </div>
          <div className="flex justify-between font-mono text-[11.5px] text-white/40">
            {BAR_DAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom — testimonial */}
      <div
        className="relative flex items-center gap-4 pt-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #c8c4ff, #4f46ff)" }}
        >
          В
        </div>
        <div>
          <div className="text-[14px]">
            «Просто прекрасно, сегодня сдавала огэ, всего прорешала 5 вариантов
            и по столько же тренировочных заданий, в итоге текст и
            грамматическое задание оказались в самом киме, спасибо большое
            создателю приложения💓💓💓»
          </div>
          <div className="mt-1 text-[13px] text-white/50">
            Валерия Р. · 9 класс
          </div>
        </div>
      </div>
    </div>
  );
}
