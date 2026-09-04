"use client";

import { useCallback, useState } from "react";
import type { RouterOutputs } from "@/trpc/react";
import type {
  AudioTaskQuestion,
  MockExamAnswer,
  MockExamSlot,
} from "@/server/db/schema";
import { ExamAudioPlayer } from "./exam-audio-player";
import { MockExamInstruction } from "./mock-exam-instruction";
import { MultipleChoiceTask } from "@/app/_components/training/listening/multiple-choice-task";
import { MatchingTask } from "@/app/_components/training/listening/matching-task";
import { GapFillTask } from "@/app/_components/training/listening/gap-fill-task";
import { TrueFalseTask } from "@/app/_components/training/reading/true-false-task";
import { HeadingsBank } from "@/app/_components/training/reading/headings-bank";
import { TextCard } from "@/app/_components/training/reading/text-card";
import { QuestionCard } from "@/app/_components/training/uoe/question-card";
import { MOCK_EXAM_UOE_START_NUMBERS } from "@/server/api/lib/mock-exams";

type Part = RouterOutputs["mockExams"]["start"]["parts"][number];

export function MockExamPart({
  part,
  answers,
  onAnswer,
  onAudioPlaybackStateChange,
}: {
  part: Part;
  answers: MockExamAnswer[];
  onAnswer: (index: number, value: MockExamAnswer) => void;
  onAudioPlaybackStateChange?: (slot: MockExamSlot, isBusy: boolean) => void;
}) {
  const [activeHeading, setActiveHeading] = useState<number | null>(null);
  const handlePlaybackStateChange = useCallback(
    (isBusy: boolean) => onAudioPlaybackStateChange?.(part.slot, isBusy),
    [onAudioPlaybackStateChange, part.slot],
  );

  if (part.kind === "audio") {
    const questions = part.questions ?? [];
    return (
      <>
        <MockExamInstruction part={part} />
        {part.audioUrl && (
          <ExamAudioPlayer
            src={part.audioUrl}
            onPlaybackStateChange={handlePlaybackStateChange}
          />
        )}
        {part.taskType === "matching" ? (
          <MatchingTask
            rubrics={questions as string[]}
            answers={answers as (number | null)[]}
            setAnswer={onAnswer}
            checked={false}
            correctAnswers={[]}
            results={[]}
            speakerCount={part.total}
          />
        ) : part.taskType === "gap_fill" ? (
          <GapFillTask
            questions={questions as string[]}
            answers={answers as (string | null)[]}
            setAnswer={onAnswer}
            checked={false}
            correctAnswers={[]}
          />
        ) : (
          <MultipleChoiceTask
            questions={questions as AudioTaskQuestion[]}
            answers={answers as (number | null)[]}
            setAnswer={onAnswer}
            checked={false}
            correctAnswers={[]}
            results={[]}
          />
        )}
      </>
    );
  }

  if (part.kind === "uoe") {
    const firstQuestionNumber =
      part.slot === "uoe_all_topics"
        ? MOCK_EXAM_UOE_START_NUMBERS.uoe_all_topics
        : MOCK_EXAM_UOE_START_NUMBERS.uoe_word_formation;
    return (
      <>
        <MockExamInstruction part={part} />
        <div className="flex flex-col gap-3.5">
          {(part.tasks ?? []).map((task, index) => (
            <QuestionCard
              key={task.id}
              n={firstQuestionNumber + index}
              task={task.task}
              origin={task.origin}
              value={(answers[index] as string | null) ?? ""}
              onChange={(value) => onAnswer(index, value)}
              checked={false}
            />
          ))}
        </div>
      </>
    );
  }

  if (part.taskType === "true_false") {
    return (
      <>
        <MockExamInstruction part={part} />
        <TrueFalseTask
          text={part.texts?.[0] ?? ""}
          statements={part.headings ?? []}
          answers={answers as (number | null)[]}
          onAnswer={(index, value) =>
            onAnswer(index, answers[index] === value ? null : value)
          }
          checked={false}
          correctAnswers={[]}
          results={[]}
        />
      </>
    );
  }

  const headings = (part.headings ?? []).map((q, index) => ({
    n: index + 1,
    q,
  }));
  const assigned = answers as (number | null)[];
  const headingLabel = (number: number | null) =>
    headings.find((heading) => heading.n === number)?.q;
  const assign = (textIndex: number) => {
    if (activeHeading === null) return;
    assigned.forEach((answer, index) => {
      if (answer === activeHeading) onAnswer(index, null);
    });
    onAnswer(textIndex, activeHeading);
    setActiveHeading(null);
  };

  return (
    <>
      <MockExamInstruction part={part} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(360px,400px)_1fr]">
        <HeadingsBank
          headings={headings}
          assigned={assigned}
          correctAnswers={[]}
          activeHeading={activeHeading}
          onPickHeading={(number) =>
            setActiveHeading(activeHeading === number ? null : number)
          }
          onDetachText={(index) => onAnswer(index, null)}
          checked={false}
        />
        <div className="flex flex-col gap-3.5">
          {(part.texts ?? []).map((body, index) => (
            <TextCard
              key={index}
              letter={String.fromCharCode(65 + index)}
              body={body}
              assignedN={assigned[index] ?? null}
              assignedHeadingQ={headingLabel(assigned[index] ?? null)}
              armed={activeHeading !== null && assigned[index] == null}
              activeHeading={activeHeading}
              onAssign={() => assign(index)}
              onClear={() => onAnswer(index, null)}
              checked={false}
              isCorrect={false}
            />
          ))}
        </div>
      </div>
    </>
  );
}
