export function ReviewBanner() {
  return (
    <div className="bg-accent-soft mt-7 flex flex-col items-start gap-5 rounded-lg border border-transparent px-6 py-6 sm:px-8 md:grid md:grid-cols-[auto_1fr_auto] md:items-center">
      <div className="bg-accent grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] text-white">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 8v4M12 16h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>

      <div>
        <div className="font-display text-[24px] leading-[1.1] tracking-[-0.02em]">
          У вас <strong className="text-accent font-normal">42 ошибки</strong> к
          разбору
        </div>
        <p className="text-ink-2 mt-1.5 max-w-[540px] text-[14px]">
          Повторите задания, в которых ошиблись. Система подберёт похожие —
          чтобы закрепить, а не вспомнить ответ.
        </p>
      </div>

      <div className="rounded-pill bg-accent inline-flex h-[44px] shrink-0 items-center justify-center px-5 text-[15px] font-medium text-white">
        Разобрать ошибки →
      </div>
    </div>
  );
}
