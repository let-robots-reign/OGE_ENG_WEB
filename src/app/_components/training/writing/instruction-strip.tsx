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

export function InstructionStrip({
  onCloseAction,
}: {
  onCloseAction: () => void;
}) {
  return (
    <div
      className="border-line mb-7 grid grid-cols-1 items-start gap-5 rounded-lg border p-5 sm:p-6 md:grid-cols-[repeat(3,1fr)_auto] md:gap-5"
      style={{
        background:
          "linear-gradient(180deg, var(--color-surface) 0%, var(--color-accent-soft) 280%)",
      }}
    >
      {STEPS.map((s) => (
        <div
          key={s.n}
          className="grid items-start"
          style={{ gridTemplateColumns: "auto 1fr", gap: 14 }}
        >
          <div
            className="grid place-items-center font-mono"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--color-accent-soft)",
              color: "var(--color-accent)",
              fontSize: 11,
              fontWeight: 500,
            }}
          >
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
      <button
        type="button"
        onClick={onCloseAction}
        title="Скрыть инструкцию"
        className="bg-surface border-line text-ink-3 grid shrink-0 place-items-center rounded-full border"
        style={{ width: 32, height: 32 }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    </div>
  );
}
