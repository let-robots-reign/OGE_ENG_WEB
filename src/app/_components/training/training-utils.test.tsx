/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-empty-function, @next/next/no-img-element, jsx-a11y/alt-text */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InfoCard } from "./info-card";
import { TaskCard } from "./task-card";
import { MCQuestion } from "./listening/mc-question";
import { QuestionCard } from "./uoe/question-card";
import { ProgressDots } from "./shared/progress-dots";
import { AudioPlayer } from "./listening/audio-player";
import { HeadingsBank } from "./reading/headings-bank";
import { TextCard } from "./reading/text-card";
import { ResultBanner } from "./writing/result-banner";
import { ResultModal } from "./shared/result-modal";
import { ReviewModal } from "./shared/review-modal";
import { TrainingSubHeader } from "./shared/training-sub-header";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("Training UI Utils Suite", () => {
  it("should render InfoCard properly", () => {
    render(
      <InfoCard tag="Grammar" title="Rule 1" body="Explanation details" />,
    );
    expect(screen.getByText("Grammar")).toBeInTheDocument();
    expect(screen.getByText("Rule 1")).toBeInTheDocument();
    expect(screen.getByText("Explanation details")).toBeInTheDocument();
  });

  it("should render TaskCard in various states", () => {
    // 1. Standard active state
    const { rerender } = render(
      <TaskCard
        kicker="РАЗДЕЛ 1"
        range="1–4"
        title="Аудирование темы"
        desc="Описание"
        type="Тест"
        items={4}
        time="10 мин"
        progress={0.5}
        href="/training/audio/1"
      />,
    );

    expect(screen.getByText("РАЗДЕЛ 1")).toBeInTheDocument();
    expect(screen.getByText("1–4")).toBeInTheDocument();
    expect(screen.getByText("Аудирование темы")).toBeInTheDocument();
    expect(screen.getByText("пройдено")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();

    // 2. Disabled state
    rerender(
      <TaskCard
        kicker="РАЗДЕЛ 1"
        range="1–4"
        title="Аудирование темы"
        desc="Описание"
        type="Тест"
        items={4}
        time="10 мин"
        disabled
      />,
    );
    expect(screen.getByText("в разработке")).toBeInTheDocument();
  });

  it("should render MCQuestion choice options", () => {
    render(
      <MCQuestion
        idx={1}
        question="Select option"
        options={["A", "B", "C"]}
        value={2}
        onChange={() => {}}
        checked={false}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Select option")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("should render QuestionCard single word gaps", () => {
    render(
      <QuestionCard
        n={1}
        task="Original word"
        origin="Gap text _____________ with label"
        value="typed"
        onChange={() => {}}
        checked={false}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Original word")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("typed");
  });

  it("should render ProgressDots indicators", () => {
    render(<ProgressDots total={5} answered={[1, 3]} />);
    // Total dots is 5
    const dots = document.querySelectorAll("div.flex.gap-1\\.5 > div");
    expect(dots).toHaveLength(5);
  });

  it("should render AudioPlayer elements", () => {
    render(<AudioPlayer src="/audio/1.mp3" />);
    const playBtn = screen.getByLabelText("Воспроизвести");
    expect(playBtn).toBeInTheDocument();
  });

  it("should render HeadingsBank list", () => {
    render(
      <HeadingsBank
        headings={[{ n: 1, q: "Header 1" }]}
        assigned={[]}
        correctAnswers={[]}
        activeHeading={null}
        onPickHeading={() => {}}
        onDetachText={() => {}}
        checked={false}
      />,
    );

    expect(screen.getByText("Header 1")).toBeInTheDocument();
  });

  it("should render TextCard details", () => {
    render(
      <TextCard
        letter="A"
        body="Text paragraph details"
        assignedN={null}
        assignedHeadingQ=""
        armed={false}
        activeHeading={null}
        onAssign={() => {}}
        onClear={() => {}}
        checked={false}
        isCorrect={false}
      />,
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("Text paragraph details")).toBeInTheDocument();
  });

  it("should render ResultBanner summary", () => {
    render(
      <ResultBanner
        correct={4}
        total={5}
        segments={[{ label: "Part A", value: "4/5", tone: "ok" }]}
        onRetry={() => {}}
      />,
    );

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("/5")).toBeInTheDocument();
    expect(screen.getByText("Part A")).toBeInTheDocument();
  });

  it("should trigger onRetry when retry button is clicked in ResultBanner", () => {
    const mockRetry = vi.fn();
    render(
      <ResultBanner correct={4} total={5} segments={[]} onRetry={mockRetry} />,
    );
    const retryBtn = screen.getByRole("button", { name: /пройти ещё раз/i });
    fireEvent.click(retryBtn);
    expect(mockRetry).toHaveBeenCalled();
  });

  it("should render ResultModal", () => {
    render(
      <ResultModal
        correct={3}
        total={5}
        timeText="02:15"
        onClose={() => {}}
        onReview={() => {}}
      />,
    );

    expect(screen.getByText("ваш результат")).toBeInTheDocument();
    expect(screen.getByText("время")).toBeInTheDocument();
    expect(screen.getByText("02:15")).toBeInTheDocument();
  });

  it("should render ReviewModal", () => {
    const items = [
      {
        badge: "1",
        title: "Test Task",
        userLabel: "My answer",
        correctLabel: "Correct answer",
        isCorrect: false,
        explanation: "Detail |why|",
      },
    ];
    render(<ReviewModal items={items} onClose={() => {}} />);

    expect(screen.getByText("Разбор ошибок")).toBeInTheDocument();
    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText(/Ваш ответ: My answer/)).toBeInTheDocument();
    expect(
      screen.getByText(/Правильный ответ: Correct answer/),
    ).toBeInTheDocument();
    expect(screen.getByText("пояснение")).toBeInTheDocument();
  });

  it("should render TrainingSubHeader statistics", () => {
    render(
      <TrainingSubHeader
        backHref="/back"
        section="Раздел 1"
        taskTitle="My task title"
        answeredCount={2}
        total={5}
        elapsedSec={125}
        onShowInstruction={() => {}}
      />,
    );

    expect(screen.getByText("Раздел 1")).toBeInTheDocument();
    expect(screen.getByText("My task title")).toBeInTheDocument();
    expect(screen.getByText("02:05")).toBeInTheDocument();
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });
});
