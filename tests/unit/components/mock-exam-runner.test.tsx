import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MockExamRunner } from "@/app/_components/mock-exams/mock-exam-runner";

const mutateAsync = vi.fn();
const invalidate = vi.fn().mockResolvedValue(undefined);
const { countdown } = vi.hoisted(() => ({
  countdown: { secondsLeft: 0, isExpired: true, isWarning: false },
}));

vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

vi.mock("@/trpc/react", () => ({
  api: {
    useUtils: () => ({
      mockExams: { list: { invalidate } },
      user: {
        getRecentActivity: { invalidate },
        getActivity: { invalidate },
        getStreak: { invalidate },
      },
    }),
    mockExams: {
      complete: {
        useMutation: () => ({ mutateAsync }),
      },
    },
  },
}));

vi.mock("@/app/_composables/use-countdown-timer", () => ({
  useCountdownTimer: () => countdown,
}));

vi.mock("@/app/_components/mock-exams/mock-exam-part", () => ({
  MockExamPart: ({
    part,
    onAudioPlaybackStateChange,
  }: {
    part: { slot: string; kind: string };
    onAudioPlaybackStateChange?: (slot: string, isBusy: boolean) => void;
  }) => (
    <div>
      Mock exam part
      {part.kind === "audio" && (
        <>
          <button
            type="button"
            onClick={() => onAudioPlaybackStateChange?.(part.slot, true)}
          >
            Start mock audio
          </button>
          <button
            type="button"
            onClick={() => onAudioPlaybackStateChange?.(part.slot, false)}
          >
            Finish mock audio
          </button>
        </>
      )}
    </div>
  ),
}));

vi.mock("@/app/_components/mock-exams/mock-exam-result-view", () => ({
  MockExamResultView: () => <div>Mock exam result</div>,
}));

const attempt = {
  attemptKey: "00000000-0000-4000-8000-000000000001",
  startedAt: new Date("2026-09-01T10:00:00Z"),
  expiresAt: new Date("2026-09-01T12:00:00Z"),
  mockExam: { id: 1, title: "Вариант 1", order: 1 },
  parts: [
    {
      slot: "audio_1_4",
      label: "Аудирование · Задания 1–4",
      kind: "audio",
      topicTitle: "Задания 1-4",
      resourceId: 1,
      taskType: "multiple_choice",
      total: 1,
      audioUrl: "/test.mp3",
      questions: [],
    },
  ],
};

describe("MockExamRunner timeout submission", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    Object.assign(countdown, {
      secondsLeft: 0,
      isExpired: true,
      isWarning: false,
    });
    mutateAsync.mockRejectedValue(new Error("Сеть недоступна"));
  });

  afterEach(() => vi.useRealTimers());

  it("tries once plus two delayed retries, then stops and shows an alert", async () => {
    render(<MockExamRunner attempt={attempt as never} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(mutateAsync).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4999);
    });
    expect(mutateAsync).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(mutateAsync).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(mutateAsync).toHaveBeenCalledTimes(3);
    expect(screen.getByRole("alert")).toHaveTextContent("Сеть недоступна");
    expect(
      screen.getByRole("button", { name: "Повторить отправку" }),
    ).toBeEnabled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(mutateAsync).toHaveBeenCalledTimes(3);
  });

  it("prevents switching parts until audio playback and its gap finish", () => {
    Object.assign(countdown, {
      secondsLeft: 7200,
      isExpired: false,
      isWarning: false,
    });
    const twoPartAttempt = {
      ...attempt,
      parts: [
        attempt.parts[0],
        {
          slot: "reading_12",
          label: "Чтение · Задание 12",
          kind: "reading",
          topicTitle: "Задание 12",
          resourceId: 2,
          taskType: "matching",
          total: 1,
          texts: ["Text"],
          headings: ["Heading"],
        },
      ],
    } as never;

    render(<MockExamRunner attempt={twoPartAttempt} />);
    const secondPart = screen.getByRole("button", {
      name: "2. Задание 12",
    });
    const next = screen.getByRole("button", { name: "Следующее →" });

    fireEvent.click(screen.getByRole("button", { name: "Start mock audio" }));
    expect(secondPart).toBeDisabled();
    expect(next).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Дождитесь завершения аудиозаписи",
    );

    fireEvent.click(screen.getByRole("button", { name: "Finish mock audio" }));
    expect(secondPart).toBeEnabled();
    expect(next).toBeEnabled();
  });
});
