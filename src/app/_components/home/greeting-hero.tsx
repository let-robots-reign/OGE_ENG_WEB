import Link from "next/link";
import { ProgressDial } from "./progress-dial";
import { getExamCountdownText, EXAM_NAME } from "@/app/_utils/exam";

// TODO: implement
export function GreetingHero({ userName }: { userName: string }) {
  return (
    <div
      className="bg-surface border-line mb-9 grid grid-cols-1 items-center gap-9 rounded-lg border p-6 shadow-sm sm:p-9 lg:grid-cols-[1.4fr_1fr]"
      style={{
        background:
          "linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-2) 100%)",
      }}
    >
      <div>
        <div className="text-ink-3 mb-[14px] inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
          <span className="bg-accent h-1.5 w-1.5 rounded-full" />
          {getExamCountdownText()} · {EXAM_NAME}
        </div>
        <h1 className="font-display m-0 text-[38px] leading-none font-normal tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
          Привет, {userName}.
        </h1>
        <p className="text-ink-2 mt-[14px] max-w-[460px] text-[16px] leading-[1.45]">
          Слабее всего — <strong>аудирование</strong> и{" "}
          <strong>словообразование</strong>. Начните с короткой тренировки,
          чтобы подтянуть их к экзамену.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/training/audio/topics"
            className="rounded-pill bg-ink text-on-ink hover:bg-ink-hover inline-flex h-[52px] items-center justify-center px-7 text-[16px] font-medium transition-colors"
          >
            Тренировать слабые места →
          </Link>
          <a
            href="#"
            className="rounded-pill border-line-2 text-ink hover:bg-surface-2 inline-flex h-[52px] items-center justify-center border bg-transparent px-7 text-[16px] font-medium transition-colors"
          >
            План на неделю
          </a>
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] items-center gap-[22px]">
        <ProgressDial value={28} max={35} />
        <div>
          <div className="text-ink-3 font-mono text-[11px] tracking-[0.08em] uppercase">
            прогноз балла
          </div>
          <div className="font-display mt-1.5 text-[44px] leading-none tracking-[-0.02em]">
            28<span className="text-ink-3 text-2xl"> / 35</span>
          </div>
          <div className="text-ink-3 mt-2 text-[13px] leading-[1.4]">
            на основе последних
            <br />
            трёх вариантов
          </div>
        </div>
      </div>
    </div>
  );
}
