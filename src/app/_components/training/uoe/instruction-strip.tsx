"use client";

const STEPS = [
  {
    label: "1 · что делать",
    body: "Преобразуйте слово, напечатанное заглавными буквами, так чтобы оно подходило по смыслу.",
  },
  {
    label: "2 · как писать",
    body: "Вводите ответ заглавными буквами, без пробелов — как в экзаменационном бланке. Глагольные формы — без сокращений.",
  },
  {
    label: "3 · после",
    body: "Нажмите «Проверить». Все ошибки можно разобрать с правильными ответами.",
  },
];

export function InstructionStrip() {
  return (
    <div
      className="border-line mb-7 grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg border p-4 sm:gap-6 sm:p-7"
      style={{
        background:
          "linear-gradient(180deg, var(--color-surface) 0%, var(--color-accent-soft) 240%)",
      }}
    >
      <div
        className="grid place-items-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "var(--color-accent-soft)",
          color: "var(--color-accent)",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.label}>
            <div className="text-ink-3 mb-1 font-mono text-[11px] tracking-[0.08em] uppercase">
              {s.label}
            </div>
            <div className="text-ink-2 text-[14px] leading-snug">{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
