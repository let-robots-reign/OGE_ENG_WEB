"use client";

import { Modal } from "@/app/_components/Modal";

export interface ReviewItem {
  badge: string;
  title: string | undefined;
  userLabel: string;
  correctLabel?: string;
  isCorrect: boolean;
  explanation?: {
    text: string;
    highlightedText?: string;
  };
}

interface ReviewModalProps {
  items: ReviewItem[];
  onClose: () => void;
}

export function ReviewModal({ items, onClose }: ReviewModalProps) {
  return (
    <Modal size={720} onClose={onClose}>
      <div className="bg-surface border-line sticky top-0 z-10 flex items-center justify-between border-b px-8 py-5">
        <div className="font-display text-[28px] leading-none tracking-[-0.02em]">
          Разбор ошибок
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="bg-surface-2 text-ink-2 grid place-items-center rounded-full"
          style={{ width: 36, height: 36 }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-5 px-8 py-6">
        {items.map((item, index) => {
          let html = "";
          if (item.explanation) {
            const { text, highlightedText } = item.explanation;
            const formatText = (s: string) => s.replace(/\n/g, "<br />");

            if (highlightedText?.trim()) {
              const phrases = highlightedText
                .split(/[\n;]+/)
                .map((p) => p.trim())
                .filter(Boolean);

              if (phrases.length > 0) {
                phrases.sort((a, b) => b.length - a.length);
                const escapedPhrases = phrases.map((p) =>
                  p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                );
                const regex = new RegExp(`(${escapedPhrases.join("|")})`, "gi");

                const highlighted = text.replace(regex, "<strong>$1</strong>");
                html = formatText(highlighted);
              } else {
                html = formatText(text);
              }
            } else {
              html = formatText(text);
            }
          }

          return (
            <div
              key={index}
              className="border-line border-b pb-5 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <div
                  className="grid shrink-0 place-items-center font-mono text-white"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    fontSize: 13,
                    background: item.isCorrect
                      ? "var(--color-ok)"
                      : "var(--color-err)",
                  }}
                >
                  {item.badge}
                </div>
                <div className="font-display mt-0.5 flex-1 text-[19px] leading-snug tracking-[-0.01em]">
                  {item.title}
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-1.5 pl-[42px] text-[14.5px]">
                <div
                  style={{
                    color: item.isCorrect
                      ? "var(--color-ok)"
                      : "var(--color-err)",
                  }}
                >
                  Ваш ответ: {item.userLabel}
                </div>
                {!item.isCorrect && item.correctLabel && (
                  <div className="text-ink-2">
                    Правильный ответ: {item.correctLabel}
                  </div>
                )}
              </div>

              {html && (
                <div className="mt-3 pl-[42px]">
                  <div className="text-ink-3 mb-1.5 font-mono text-[11px] tracking-[0.1em] uppercase">
                    пояснение
                  </div>
                  <p
                    className="text-ink-2 text-[14.5px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
