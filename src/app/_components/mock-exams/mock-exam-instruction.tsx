"use client";

import type { RouterOutputs } from "@/trpc/react";
import {
  LISTENING_INSTRUCTIONS,
  READING_INSTRUCTIONS,
  UOE_INSTRUCTIONS,
  type TaskInstruction,
} from "@/app/_components/training/shared/task-instructions";

type Part = RouterOutputs["mockExams"]["start"]["parts"][number];

// The snapshot widens `taskType` to the union of both task families, so the
// lookup goes through an index signature instead of narrowing by cast.
const instructionFor = (part: Part): TaskInstruction | undefined => {
  if (part.kind === "uoe") {
    return UOE_INSTRUCTIONS[
      part.slot === "uoe_word_formation" ? "word_formation" : "all_topics"
    ];
  }
  const byTaskType: Record<string, TaskInstruction | undefined> =
    part.kind === "audio" ? LISTENING_INSTRUCTIONS : READING_INSTRUCTIONS;
  return part.taskType ? byTaskType[part.taskType] : undefined;
};

export function MockExamInstruction({ part }: { part: Part }) {
  const instruction = instructionFor(part);
  if (!instruction) return null;

  return (
    <div className="mb-7">
      <h2 className="font-display mt-2.5 text-[16px] leading-[1.15] tracking-[-0.02em] sm:text-[26px]">
        {instruction.heading}
      </h2>
      <p className="text-ink-3 mt-3 text-[13px] leading-relaxed">
        {instruction.hint}
      </p>
    </div>
  );
}
