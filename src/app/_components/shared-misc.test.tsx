/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-empty-function, @next/next/no-img-element, jsx-a11y/alt-text */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlobalSpinner } from "./GlobalSpinner";
import { Modal } from "./Modal";
import { MenuListItem } from "./MenuListItem";
import { ListeningExplanation } from "./ListeningExplanation";
import { TrainingExplanation } from "./TrainingExplanation";
import { DiagnosticsCard } from "./DiagnosticsCard";
import { TheoryCard } from "./theory-card";
import { TrainingCard } from "./training-card";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

vi.mock("@tanstack/react-query", () => ({
  useIsFetching: vi.fn(),
  useIsMutating: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Shared Miscellaneous Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear document.body to prevent test leakage from portals
    document.body.innerHTML = "";
  });

  describe("GlobalSpinner", () => {
    it("should render null when not fetching or mutating", () => {
      vi.mocked(useIsFetching).mockReturnValue(0);
      vi.mocked(useIsMutating).mockReturnValue(0);

      const { container } = render(<GlobalSpinner />);
      expect(container.firstChild).toBeNull();
    });

    it("should render spinner overlay when fetching", () => {
      vi.mocked(useIsFetching).mockReturnValue(1);
      vi.mocked(useIsMutating).mockReturnValue(0);

      const { container } = render(<GlobalSpinner />);
      // Should render container divs
      expect(container.querySelector("div")).toBeInTheDocument();
    });

    it("should render spinner overlay when mutating", () => {
      vi.mocked(useIsFetching).mockReturnValue(0);
      vi.mocked(useIsMutating).mockReturnValue(1);

      const { container } = render(<GlobalSpinner />);
      expect(container.querySelector("div")).toBeInTheDocument();
    });
  });

  describe("Modal", () => {
    it("should render title and children", () => {
      render(
        <Modal title="Test Modal" onClose={() => {}}>
          <div>Modal Body</div>
        </Modal>,
      );

      expect(screen.getByText("Test Modal")).toBeInTheDocument();
      expect(screen.getByText("Modal Body")).toBeInTheDocument();
    });

    it("should call onClose when clicking backdrop", () => {
      const mockClose = vi.fn();
      render(
        <Modal onClose={mockClose}>
          <div>Body</div>
        </Modal>,
      );

      // In JSDOM, portal content is appended to document.body.
      // The backdrop is a div on the root of document.body which is empty.
      const emptyDivs = Array.from(document.body.children).filter(
        (el) => el.tagName === "DIV" && el.innerHTML === "",
      );

      emptyDivs.forEach((backdrop) => {
        fireEvent.click(backdrop);
      });

      expect(mockClose).toHaveBeenCalled();
    });

    it("should call onClose when Escape key is pressed", () => {
      const mockClose = vi.fn();
      render(
        <Modal onClose={mockClose}>
          <div>Body</div>
        </Modal>,
      );

      fireEvent.keyDown(window, { key: "Escape" });
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it("should apply correct size class based on size prop", () => {
      render(
        <Modal onClose={() => {}} size="large">
          <div>Large Body</div>
        </Modal>,
      );

      // Check modal wrapper div classes (usually second child after backdrop in body portals)
      const modalDiv = screen
        .getByText("Large Body")
        .closest("div[class*='modal']");
      expect(modalDiv).toBeInTheDocument();
    });
  });

  describe("MenuListItem", () => {
    const mockTopic = {
      id: 1,
      title: "Test Topic",
      category: "audio",
      isActive: true,
    };

    it("should render link when active", () => {
      render(
        <MenuListItem
          topic={mockTopic}
          baseClickLink="/target"
          isNotCompleted={false}
        />,
      );

      expect(screen.getByText("Test Topic")).toBeInTheDocument();
      expect(screen.queryByText("в разработке")).not.toBeInTheDocument();
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        "/target?topic=1",
      );
    });

    it("should render 'в разработке' status and no link when incomplete", () => {
      render(
        <MenuListItem
          topic={mockTopic}
          baseClickLink="/target"
          isNotCompleted={true}
        />,
      );

      expect(screen.getByText("Test Topic")).toBeInTheDocument();
      expect(screen.getByText("в разработке")).toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });

  describe("ListeningExplanation", () => {
    it("should render explanation tables with correct answers", () => {
      const questions = [
        { question: "Question 1", options: ["Opt 1", "Opt 2", "Opt 3"] },
      ];
      render(
        <ListeningExplanation
          questions={questions}
          userAnswers={[2]}
          correctAnswers={[3]}
          explanation={["Explanation text with |accent| word"]}
        />,
      );

      expect(screen.getByText("Question 1")).toBeInTheDocument();
      expect(screen.getByText(/Ваш ответ: Opt 2/)).toBeInTheDocument();
      expect(screen.getByText(/Правильный ответ: Opt 3/)).toBeInTheDocument();
      expect(screen.getByText(/Пояснение:/)).toBeInTheDocument();
      // Should inject strong tag
      expect(document.querySelector("strong")).toBeInTheDocument();
    });
  });

  describe("TrainingExplanation", () => {
    it("should render matching text explanations", () => {
      render(
        <TrainingExplanation
          headings={["Heading 0", "Heading 1", "Heading 2"]}
          userAnswers={["1"]}
          correctAnswers={[2]}
          explanation="Match description with |highlight|"
        />,
      );

      expect(screen.getByText(/1\. Heading 0/)).toBeInTheDocument();
      expect(screen.getByText(/Heading 2/)).toBeInTheDocument();
    });
  });

  describe("DiagnosticsCard", () => {
    const card = {
      key: "grammar",
      title: "Grammar Diagnostic",
      image: "img.png",
    };

    it("should render card content", () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: "unauthenticated",
      } as any);

      render(<DiagnosticsCard card={card} />);
      expect(screen.getByText("Grammar Diagnostic")).toBeInTheDocument();
    });

    it("should open modal when clicking as guest", () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: "unauthenticated",
      } as any);

      render(<DiagnosticsCard card={card} />);
      const link = screen.getByRole("link");
      fireEvent.click(link);

      expect(
        screen.getByText("Доступно только авторизованным пользователям"),
      ).toBeInTheDocument();
    });
  });

  describe("Static Cards", () => {
    it("should render TheoryCard correctly", () => {
      render(<TheoryCard title="Theory Topic" image="theory.png" />);
      expect(screen.getByText("Theory Topic")).toBeInTheDocument();
    });

    it("should render TrainingCard correctly", () => {
      render(<TrainingCard title="Training Topic" image="train.png" isBeta />);
      expect(screen.getByText("Training Topic")).toBeInTheDocument();
      expect(screen.getByText("бета-версия")).toBeInTheDocument();
    });
  });
});
