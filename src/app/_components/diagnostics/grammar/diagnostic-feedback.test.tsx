import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DiagnosticFeedback } from "./diagnostic-feedback";

describe("DiagnosticFeedback Component", () => {
  it("should render markdown text correctly", () => {
    const feedbackText =
      "## Grammar Analysis\n\nThis is a *diagnostic* test feedback.";
    const { container } = render(
      <DiagnosticFeedback feedback={feedbackText} />,
    );

    const heading = container.querySelector("h2");
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toBe("Grammar Analysis");

    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.innerHTML).toContain(
      "This is a <em>diagnostic</em> test feedback.",
    );
  });

  it("should convert CORRECT[...] and INCORRECT[...] markers into styled span elements", () => {
    const feedbackText =
      "Your answer is CORRECT[excellent] and not INCORRECT[wrong text].";
    const { container } = render(
      <DiagnosticFeedback feedback={feedbackText} />,
    );

    const correctSpan = container.querySelector("span.fb-correct");
    expect(correctSpan).toBeInTheDocument();
    expect(correctSpan?.textContent).toBe("excellent");

    const incorrectSpan = container.querySelector("span.fb-incorrect");
    expect(incorrectSpan).toBeInTheDocument();
    expect(incorrectSpan?.textContent).toBe("wrong text");
  });
});
