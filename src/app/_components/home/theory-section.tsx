import { TheoryCard } from "./theory-card";

const CARDS = [
  {
    title: "Общая информация об экзамене",
    desc: "Структура, баллы, как заполнять бланк, тайминг",
    chip: "5 мин чтения",
    href: "/theory/general",
  },
  {
    title: "Языковой материал",
    desc: "Времена, артикли, словообразование, лексика",
    chip: "20 тем",
    href: "/theory/use-of-english",
  },
  {
    title: "Письмо",
    desc: "Электронное письмо: структура, штампы, критерии",
    chip: "3 темы",
    href: "/theory/writing",
  },
] as const;

export function TheorySection() {
  return (
    <section id="theory" className="mb-[72px]">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
            03 — справочник
          </div>
          <h2 className="font-display m-0 mt-2 text-[30px] leading-none font-normal tracking-[-0.025em] sm:text-[38px]">
            Теория
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {CARDS.map((card) => (
          <TheoryCard key={card.href} {...card} />
        ))}
      </div>
    </section>
  );
}
