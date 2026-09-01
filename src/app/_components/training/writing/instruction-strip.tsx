"use client";

const STEPS = [
  {
    n: "01",
    title: "Структура",
    body: "Соберите шаблон письма из шести предложений — обращение, благодарность, основная часть, прощание.",
  },
  {
    n: "02",
    title: "Клише + связки",
    body: "Соберите фразы и подберите перевод 24 слов-связок. Без них письмо звучит сухо.",
  },
  {
    n: "03",
    title: "Полный ответ",
    body: "Полный ответ всегда содержит причину и личное отношение — без них баллы снимут.",
  },
];

export function InstructionStrip() {
  return (
    <div className="border-line mb-7 grid grid-cols-1 items-start gap-5 rounded-lg border bg-[linear-gradient(180deg,var(--color-surface)_0%,var(--color-accent-soft)_280%)] p-5 sm:p-6 md:grid-cols-3 md:gap-5">
      {STEPS.map((s) => (
        <div
          key={s.n}
          className="grid grid-cols-[auto_1fr] items-start gap-3.5"
        >
          <div className="bg-accent-soft text-accent grid size-8 place-items-center rounded-xs font-mono text-[11px] font-medium">
            {s.n}
          </div>
          <div>
            <div className="text-ink text-[14px] font-medium">{s.title}</div>
            <div className="text-ink-3 mt-1 text-[13px] leading-relaxed">
              {s.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
