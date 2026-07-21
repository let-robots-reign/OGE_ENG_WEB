import { VariantCard } from "./variant-card";

// TODO: implement real Варианты logic
const VARIANTS = [
  { num: "01", state: "Сдан", scoreValue: 32, date: "12 апр", accent: "ok" },
  { num: "02", state: "Сдан", scoreValue: 29, date: "21 апр", accent: "ok" },
  {
    num: "03",
    state: "В работе",
    scoreValue: null,
    date: "вчера",
    accent: "warn",
  },
  {
    num: "04",
    state: "Не начат",
    scoreValue: null,
    date: "",
    accent: "neutral",
  },
  {
    num: "05",
    state: "Не начат",
    scoreValue: null,
    date: "",
    accent: "neutral",
  },
  {
    num: "06",
    state: "Не начат",
    scoreValue: null,
    date: "",
    accent: "neutral",
  },
] as const;

export function VariantsSection() {
  return (
    <section id="variants" className="mb-[72px]">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
            02 — целиком
          </div>
          <h2 className="font-display m-0 mt-2 text-[30px] leading-none font-normal tracking-[-0.025em] sm:text-[38px]">
            Варианты
          </h2>
        </div>
        <div className="text-ink-3 hidden text-[14px] sm:block">
          Полный экзамен с таймером · 2 часа
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {VARIANTS.map((v) => (
          <VariantCard key={v.num} {...v} />
        ))}
      </div>
    </section>
  );
}
