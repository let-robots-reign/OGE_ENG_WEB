import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MatchingTask } from "./matching-task";

const rubrics = [
  "Individual and economical",
  "Varied and spicy",
  "Enjoyable and unifying",
  "Creative and engaging",
  "Healthy and nutritious",
  "Stressful and time-consuming",
];

describe("MatchingTask Component", () => {
  it("should render all 6 rubrics and one select per speaker", () => {
    render(
      <MatchingTask
        rubrics={rubrics}
        answers={Array(5).fill(null)}
        setAnswer={vi.fn()}
        checked={false}
        correctAnswers={[1, 2, 3, 4, 5]}
        results={[]}
        speakerCount={5}
      />,
    );

    rubrics.forEach((text) =>
      expect(screen.getByText(text)).toBeInTheDocument(),
    );
    expect(screen.getAllByRole("combobox")).toHaveLength(5);
  });

  it("should disable a rubric already taken by another speaker", () => {
    // Speaker A took rubric 1, speaker B took rubric 3.
    render(
      <MatchingTask
        rubrics={rubrics}
        answers={[1, 3, null, null, null]}
        setAnswer={vi.fn()}
        checked={false}
        correctAnswers={[1, 2, 3, 4, 5]}
        results={[]}
        speakerCount={5}
      />,
    );

    const selects = screen.getAllByRole("combobox");

    // Speaker C may not reuse 1 or 3, but 2 stays available.
    const optionsForC = within(selects[2]!).getAllByRole("option");
    expect(optionsForC.find((o) => o.textContent === "1")).toBeDisabled();
    expect(optionsForC.find((o) => o.textContent === "3")).toBeDisabled();
    expect(optionsForC.find((o) => o.textContent === "2")).toBeEnabled();

    // A speaker's own current choice stays selectable for itself.
    const optionsForA = within(selects[0]!).getAllByRole("option");
    expect(optionsForA.find((o) => o.textContent === "1")).toBeEnabled();
  });

  it("should report the chosen rubric number for the right speaker", () => {
    const setAnswer = vi.fn();
    render(
      <MatchingTask
        rubrics={rubrics}
        answers={Array(5).fill(null)}
        setAnswer={setAnswer}
        checked={false}
        correctAnswers={[1, 2, 3, 4, 5]}
        results={[]}
        speakerCount={5}
      />,
    );

    fireEvent.change(screen.getAllByRole("combobox")[3]!, {
      target: { value: "4" },
    });

    expect(setAnswer).toHaveBeenCalledWith(3, 4);
  });

  it("should label each select with its speaker for screen readers", () => {
    render(
      <MatchingTask
        rubrics={rubrics}
        answers={Array(5).fill(null)}
        setAnswer={vi.fn()}
        checked={false}
        correctAnswers={[1, 2, 3, 4, 5]}
        results={[]}
        speakerCount={5}
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "Рубрика для говорящего A" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Рубрика для говорящего E" }),
    ).toBeInTheDocument();
  });

  it("should disable every select once answers are checked", () => {
    render(
      <MatchingTask
        rubrics={rubrics}
        answers={[1, 2, 3, 4, 5]}
        setAnswer={vi.fn()}
        checked={true}
        correctAnswers={[1, 2, 3, 4, 6]}
        results={[true, true, true, true, false]}
        speakerCount={5}
      />,
    );

    screen
      .getAllByRole("combobox")
      .forEach((select) => expect(select).toBeDisabled());

    // The wrong speaker E gets the expected rubric spelled out.
    expect(screen.getByText("Правильно: 6")).toBeInTheDocument();
  });

  it("should colour cells from the server verdict, not its own comparison", () => {
    // The server graded every speaker correct. A cell that re-derived the
    // verdict by comparing its own value would paint all five red instead.
    render(
      <MatchingTask
        rubrics={rubrics}
        answers={[1, 2, 3, 4, 5]}
        setAnswer={vi.fn()}
        checked={true}
        correctAnswers={[9, 9, 9, 9, 9]}
        results={[true, true, true, true, true]}
        speakerCount={5}
      />,
    );

    screen
      .getAllByRole("combobox")
      .forEach((select) => expect(select).toHaveClass("border-emerald-500"));
    // No cell offers a correction, which a local comparison would have done.
    expect(screen.queryByText("Правильно: 9")).not.toBeInTheDocument();
  });

  it("should render only as many speakers as the task expects", () => {
    render(
      <MatchingTask
        rubrics={["One", "Two", "Three", "Four"]}
        answers={Array(3).fill(null)}
        setAnswer={vi.fn()}
        checked={false}
        correctAnswers={[1, 2, 3]}
        results={[]}
        speakerCount={3}
      />,
    );

    expect(screen.getAllByRole("combobox")).toHaveLength(3);
    expect(
      screen.getByRole("combobox", { name: "Рубрика для говорящего C" }),
    ).toBeInTheDocument();
    // Four rubrics means four selectable numbers, plus the empty placeholder.
    expect(
      within(screen.getAllByRole("combobox")[0]!).getAllByRole("option"),
    ).toHaveLength(5);
  });
});
