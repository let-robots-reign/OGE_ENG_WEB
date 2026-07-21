import { IconHeadphones, IconBook, IconGrammar, IconPen } from "./icons";
import { TrainingCard } from "./training-card";

const CARDS = [
  {
    title: "Аудирование",
    en: "Listening",
    icon: <IconHeadphones />,
    tone: "indigo" as const,
    href: "/training/audio/topics",
  },
  {
    title: "Чтение",
    en: "Reading",
    icon: <IconBook />,
    tone: "warm" as const,
    href: "/training/reading/topics",
  },
  {
    title: "Языковой материал",
    en: "Use of English",
    icon: <IconGrammar />,
    tone: "mint" as const,
    href: "/training/use-of-english/topics",
  },
  {
    title: "Письмо",
    en: "Writing",
    icon: <IconPen />,
    tone: "sand" as const,
    href: "/training/writing",
  },
] as const;

export function TrainingSection() {
  return (
    <section id="training" className="mb-[72px]">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
            01 — по разделам
          </div>
          <h2 className="font-display m-0 mt-2 text-[30px] leading-none font-normal tracking-[-0.025em] sm:text-[38px]">
            Тренировки
          </h2>
        </div>
        <div className="text-ink-3 hidden text-[14px] sm:block">
          Отдельные задания на отработку
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {CARDS.map((card) => (
          <TrainingCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
