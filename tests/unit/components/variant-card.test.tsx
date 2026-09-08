import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VariantCard } from "@/app/_components/home/variant-card";

describe("VariantCard", () => {
  it("uses the grade-specific color", () => {
    render(
      <VariantCard
        num="01"
        state="завершён"
        scoreValue={40}
        scoreMax={47}
        grade={2}
        href="/mock-exams/1/result/17"
        accent="ok"
      />,
    );

    expect(screen.getByText("оценка 2")).toHaveClass("text-err");
  });
});
