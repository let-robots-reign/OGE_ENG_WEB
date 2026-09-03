import Link from "next/link";
import type { MockExamResultDetails } from "@/server/db/schema";
import { formatClock } from "@/app/_utils/formatClock";

function HighlightedExplanation({
  text,
  highlightedText,
}: {
  text: string;
  highlightedText?: string;
}) {
  const phrases = (highlightedText ?? "")
    .split(/[\n;]+/)
    .map((phrase) => phrase.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (!phrases.length) return <>{text}</>;

  const escaped = phrases.map((phrase) =>
    phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const phraseSet = new Set(phrases.map((phrase) => phrase.toLowerCase()));
  const fragments = text.split(new RegExp(`(${escaped.join("|")})`, "gi"));

  return (
    <>
      {fragments.map((fragment, index) =>
        phraseSet.has(fragment.toLowerCase()) ? (
          <strong key={index}>{fragment}</strong>
        ) : (
          fragment
        ),
      )}
    </>
  );
}

export function MockExamResultView({
  details,
  backHref = "/#variants",
}: {
  details: MockExamResultDetails;
  backHref?: string;
}) {
  return (
    <main className="mx-auto max-w-[1050px] px-5 py-10 sm:px-8">
      <div className="bg-ink-panel rounded-lg p-7 text-white sm:p-9">
        <div className="text-[12px] font-medium tracking-[0.12em] text-white/60 uppercase">
          {details.mockExam.title}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-6">
          <div className="font-display text-[64px] leading-none">
            {details.correctCount}
            <span className="text-[30px] text-white/45">/{details.total}</span>
          </div>
          <div className="pb-1">
            <div className="font-display text-[30px]">
              Оценка {details.grade}
            </div>
            <div className="mt-1 text-[14px] text-white/60">
              {details.percentage}% · {formatClock(details.timeSpent)} ·{" "}
              {details.timedOut ? "время истекло" : "завершён вручную"}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {details.parts.map((part) => (
          <div
            key={part.slot}
            className="border-line bg-surface rounded-lg border p-5"
          >
            <div className="text-ink-3 text-[12px] uppercase">{part.kind}</div>
            <div className="font-display mt-2 text-[21px]">{part.label}</div>
            <div className="mt-3 font-mono text-[16px]">
              {part.correctCount} / {part.total}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-9">
        <h2 className="font-display text-[30px]">Разбор ответов</h2>
        <div className="mt-5 flex flex-col gap-8">
          {details.parts.map((part) => (
            <div key={part.slot}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[23px]">{part.label}</h3>
                <span className="text-ink-3 font-mono text-[13px]">
                  {part.correctCount}/{part.total}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {part.items.map((item, index) => (
                  <article
                    key={`${item.label}-${index}`}
                    className={`rounded-lg border p-5 ${item.isCorrect ? "border-ok bg-ok-soft/30" : "border-err bg-err-soft/30"}`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-full font-mono text-[12px] text-white ${item.isCorrect ? "bg-ok" : "bg-err"}`}
                      >
                        {item.label}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="leading-relaxed font-medium">
                          {item.title}
                        </div>
                        {item.origin && (
                          <div className="text-ink-3 mt-2 text-[13px]">
                            Исходное слово: <strong>{item.origin}</strong>
                          </div>
                        )}
                        <div className="mt-3 grid gap-2 text-[13px] sm:grid-cols-2">
                          <div>
                            Ваш ответ: <strong>{item.userAnswer}</strong>
                          </div>
                          <div>
                            Правильный:{" "}
                            <strong className="text-ok">
                              {item.correctAnswer}
                            </strong>
                          </div>
                        </div>
                        {item.explanation && (
                          <div className="border-line bg-surface mt-4 rounded-md border p-4 text-[13.5px] leading-relaxed whitespace-pre-line">
                            <HighlightedExplanation
                              text={item.explanation}
                              highlightedText={item.highlightedText}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link
        href={backHref}
        className="bg-ink text-on-ink rounded-pill mt-9 inline-flex h-11 items-center px-5 text-[14px] font-medium"
      >
        Вернуться к вариантам →
      </Link>
    </main>
  );
}
