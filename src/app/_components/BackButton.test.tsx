import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackButton } from "./BackButton";

const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe("BackButton", () => {
  it("should render correctly", () => {
    render(<BackButton />);
    const button = screen.getByText("<-");
    expect(button).toBeInTheDocument();
  });

  it("should call router.back() when clicked", () => {
    render(<BackButton />);
    const button = screen.getByText("<-");
    fireEvent.click(button);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("should apply backButton CSS module class name", () => {
    const { container } = render(<BackButton />);
    expect(container.firstChild).toHaveClass(/backButton/);
  });
});
