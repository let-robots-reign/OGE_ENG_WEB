"use client";

import { useState } from "react";
import { Modal } from "@/app/_components/Modal";
import {
  ReviewItems,
  ReviewModal,
  type ReviewItem,
} from "../shared/review-modal";

interface ExamReviewStep {
  label: string;
  items: ReviewItem[];
}

interface ExamReviewModalProps {
  steps: ExamReviewStep[];
  onClose: () => void;
}

export function ExamReviewModal({ steps, onClose }: ExamReviewModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (steps.length === 1) {
    return <ReviewModal items={steps[0]?.items ?? []} onClose={onClose} />;
  }

  return (
    <Modal size={720} onClose={onClose}>
      <div className="bg-surface border-line sticky top-0 z-10 border-b px-8 pt-5">
        <div className="flex items-center justify-between pb-4">
          <div className="font-display text-[28px] leading-none tracking-[-0.02em]">
            Разбор заданий
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="bg-surface-2 text-ink-2 grid h-9 w-9 place-items-center rounded-full"
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
        <div className="flex gap-1 overflow-x-auto">
          {steps.map((step, index) => (
            <button
              key={`${step.label}-${index}`}
              type="button"
              onClick={() => setActiveTab(index)}
              className={`shrink-0 border-b-2 px-4 py-3 text-[13.5px] font-medium ${
                index === activeTab
                  ? "border-ink text-ink"
                  : "text-ink-3 border-transparent"
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      <ReviewItems items={steps[activeTab]?.items ?? []} />
    </Modal>
  );
}
