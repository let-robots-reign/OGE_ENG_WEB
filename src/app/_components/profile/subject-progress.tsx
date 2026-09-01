import { SectionEyebrow } from "./section-eyebrow";
import { SubjectCard } from "./subject-card";

type SubjectKey = "audio" | "reading" | "use-of-english" | "writing";

interface Subject {
  key: SubjectKey;
  done: number;
  total: number;
  pct: number;
  avgCorrect: number;
  avgMax: number;
}

const META: Record<
  SubjectKey,
  {
    title: string;
    en: string;
    pillClass: string;
    barClass: string;
  }
> = {
  audio: {
    title: "Аудирование",
    en: "Listening",
    pillClass: "bg-tone-indigo text-tone-indigo-ink",
    barClass: "bg-tone-indigo-ink",
  },
  reading: {
    title: "Чтение",
    en: "Reading",
    pillClass: "bg-tone-warm text-tone-warm-ink",
    barClass: "bg-tone-warm-ink",
  },
  "use-of-english": {
    title: "Языковой материал",
    en: "Use of English",
    pillClass: "bg-tone-mint text-tone-mint-ink",
    barClass: "bg-tone-mint-ink",
  },
  writing: {
    title: "Письмо",
    en: "Writing",
    pillClass: "bg-tone-sand text-tone-sand-ink",
    barClass: "bg-tone-sand-ink",
  },
};

export function SubjectProgress({ subjects }: { subjects: Subject[] }) {
  return (
    <section className="mb-[72px]">
      <div className="mb-5 flex items-end justify-between">
        <SectionEyebrow>02 — прогресс по разделам</SectionEyebrow>
        <div className="text-ink-3 hidden items-center gap-2 text-[14px] sm:flex">
          Доля выполненных заданий и средний балл
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {subjects.map((s) => {
          const meta = META[s.key];
          return (
            <SubjectCard
              key={s.key}
              title={meta.title}
              en={meta.en}
              pillClass={meta.pillClass}
              barClass={meta.barClass}
              done={s.done}
              total={s.total}
              pct={s.pct}
              avgCorrect={s.avgCorrect}
              avgMax={s.avgMax}
            />
          );
        })}
      </div>
    </section>
  );
}
