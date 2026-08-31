import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GapFillTask } from "@/app/_components/training/listening/gap-fill-task";

describe("GapFillTask Component", () => {
  const sampleQuestions = [
    "Age of the respondent ______________________ years old",
    "Date of birth ____________________, 30th, 2004",
    "Favourite sports activity _____________________________",
    "The school subject he/she is good at _______",
    "Foreign language(s) __________________________",
    "Career plans _________________________",
  ];

  const sampleCorrectAnswers = [
    "FIFTEEN",
    "MAY",
    "SWIMMING",
    "MATHS",
    "FRENCH",
    "DOCTOR",
  ];

  it("should render all 6 questions with numbered badges (6 to 11)", () => {
    render(
      <GapFillTask
        questions={sampleQuestions}
        answers={Array(6).fill(null)}
        setAnswer={vi.fn()}
        checked={false}
        correctAnswers={sampleCorrectAnswers}
      />,
    );

    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();

    expect(screen.getByText("Age of the respondent")).toBeInTheDocument();
    expect(screen.getByText("years old")).toBeInTheDocument();
    expect(screen.getByText("Favourite sports activity")).toBeInTheDocument();
  });

  it("should handle user input, upper-case conversion, and call setAnswer with trimmed string", () => {
    const handleSetAnswer = vi.fn();
    render(
      <GapFillTask
        questions={sampleQuestions}
        answers={Array(6).fill(null)}
        setAnswer={handleSetAnswer}
        checked={false}
        correctAnswers={sampleCorrectAnswers}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0]!, { target: { value: "fifteen" } });

    expect(handleSetAnswer).toHaveBeenCalledWith(0, "FIFTEEN");
  });

  it("should call setAnswer with null if input is whitespace or cleared", () => {
    const handleSetAnswer = vi.fn();
    render(
      <GapFillTask
        questions={sampleQuestions}
        answers={["FIFTEEN", null, null, null, null, null]}
        setAnswer={handleSetAnswer}
        checked={false}
        correctAnswers={sampleCorrectAnswers}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0]!, { target: { value: "   " } });

    expect(handleSetAnswer).toHaveBeenCalledWith(0, null);
  });

  it("should display correct status (green) when checked and answer is correct", () => {
    render(
      <GapFillTask
        questions={sampleQuestions}
        answers={["FIFTEEN", "MAY", null, null, null, null]}
        setAnswer={vi.fn()}
        checked={true}
        correctAnswers={sampleCorrectAnswers}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveClass("border-emerald-500");
    expect(inputs[1]).toHaveClass("border-emerald-500");
    expect(screen.queryByText(/Правильно: FIFTEEN/i)).not.toBeInTheDocument();
  });

  it("should display error status (red) and correct answer hint when checked and answer is wrong or empty", () => {
    render(
      <GapFillTask
        questions={sampleQuestions}
        answers={["15", null, "FOOTBALL", null, null, null]}
        setAnswer={vi.fn()}
        checked={true}
        correctAnswers={sampleCorrectAnswers}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveClass("border-rose-500");
    expect(inputs[1]).toHaveClass("border-rose-500");
    expect(inputs[2]).toHaveClass("border-rose-500");

    expect(screen.getByText("FIFTEEN")).toBeInTheDocument();
    expect(screen.getByText("MAY")).toBeInTheDocument();
    expect(screen.getByText("SWIMMING")).toBeInTheDocument();
  });

  it("should disable input fields when checked is true", () => {
    render(
      <GapFillTask
        questions={sampleQuestions}
        answers={Array(6).fill(null)}
        setAnswer={vi.fn()}
        checked={true}
        correctAnswers={sampleCorrectAnswers}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("should support array of acceptable answer variants (string[][])", () => {
    const multiVariantAnswers = [
      ["FIFTEEN", "15"],
      ["MAY"],
      ["SWIMMING"],
      ["MATHS", "MATH"],
      ["FRENCH"],
      ["DOCTOR"],
    ];

    render(
      <GapFillTask
        questions={sampleQuestions}
        answers={["15", "MAY", null, "MATH", null, null]}
        setAnswer={vi.fn()}
        checked={true}
        correctAnswers={multiVariantAnswers}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    // "15" matches second variant of question 0
    expect(inputs[0]).toHaveClass("border-emerald-500");
    // "MAY" matches question 1
    expect(inputs[1]).toHaveClass("border-emerald-500");
    // "MATH" matches second variant of question 3
    expect(inputs[3]).toHaveClass("border-emerald-500");
  });
});
