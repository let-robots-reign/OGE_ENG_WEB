import Link from "next/link";
import { SectionSubHeader } from "@/app/_components/training/shared/training-sub-header";
import { DiagnosticFeedback } from "./diagnostic-feedback";

interface DiagnosticResultViewProps {
  feedback: string;
  partial?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryError?: string | null;
  /** When set, shows the date the diagnostics was completed (revisit mode). */
  completedAt?: Date;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

export function DiagnosticResultView({
  feedback,
  completedAt,
  partial = false,
  onRetry,
  isRetrying = false,
  retryError,
}: DiagnosticResultViewProps) {
  return (
    <>
      <SectionSubHeader
        section="Диагностика · грамматика"
        title="Результаты"
        backHref="/"
      />
      <div className="mx-auto w-full max-w-[820px] px-5 pt-6 pb-24 sm:px-8 sm:pt-8">
        <div
          className="rounded-lg p-6 text-white sm:p-8"
          style={{ background: "var(--color-ink-panel)" }}
        >
          <div className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.12em] text-white/55 uppercase">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-accent-2)" }}
            />
            {partial ? "разбор готов частично" : "разбор готов"}
          </div>
          <h1 className="font-display mt-3 text-[28px] leading-tight tracking-[-0.025em] sm:text-[40px]">
            Твой персональный разбор
          </h1>
          <p className="mt-2.5 max-w-[520px] text-[15px] leading-[1.5] text-white/70">
            {partial
              ? "Часть 1 готова. Доступные оценки переводов показаны ниже. Непроверенные ответы не считаются ошибками; диагностика пока не завершена."
              : "Мы проанализировали ответы по обеим частям. Зелёным отмечены верные варианты, красным — ошибки с исправлением."}
          </p>
          {completedAt && (
            <div className="mt-3.5 font-mono text-[12px] tracking-[0.05em] text-white/45">
              Пройдено {formatDate(completedAt)}
            </div>
          )}
        </div>

        {partial && onRetry && (
          <div className="mt-6 rounded-lg border p-5" aria-live="polite">
            <p>
              Ответы сохранены. Повторная проверка затронет только переводы без
              оценки. Между попытками нужна пауза не менее минуты; действует
              лимит 3 попытки за 24 часа.
            </p>
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="rounded-pill mt-3 border px-5 py-3 disabled:opacity-60"
            >
              {isRetrying
                ? "Проверяем оставшиеся переводы…"
                : "Повторить проверку переводов"}
            </button>
            {retryError && (
              <p role="alert" className="mt-3">
                {retryError}
              </p>
            )}
          </div>
        )}
        <div className="mt-6">
          <DiagnosticFeedback feedback={feedback} />
        </div>

        <div className="mt-7 flex sm:justify-end">
          <Link
            href="/"
            className="rounded-pill text-on-ink inline-flex h-12 w-full items-center justify-center px-7 text-[15px] font-medium transition-transform hover:-translate-y-px sm:w-auto"
            style={{ background: "var(--color-ink)" }}
          >
            На главную →
          </Link>
        </div>
      </div>
    </>
  );
}
