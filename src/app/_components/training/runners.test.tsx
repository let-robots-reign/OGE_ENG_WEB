/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UoERunner } from "./uoe/uoe-runner";
import { ListeningRunner } from "./listening/listening-runner";
import { ReadingRunner } from "./reading/reading-runner";
import { WritingRunner } from "./writing/writing-runner";
import { api } from "@/trpc/react";
import posthog from "posthog-js";

// Mock routers/searchparams
const mockBack = vi.fn();
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (_key: string) => "42",
  }),
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: { user: { id: "user-1" } },
  })),
}));

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
    reset: vi.fn(),
  },
}));

// Mock Audio element for listening player
global.HTMLAudioElement = vi.fn().mockImplementation(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

// Mock tRPC Queries and Mutations
const mockCheckUoe = vi.fn();
const mockCheckListening = vi.fn();
const mockCheckReading = vi.fn();
const mockCheckWriting = vi.fn();
const mockLogResult = vi.fn();

vi.mock("@/trpc/react", () => ({
  api: {
    training: {
      getUoeTraining: {
        useQuery: vi.fn(),
      },
      checkUoeTraining: {
        useMutation: vi.fn(() => ({
          mutateAsync: mockCheckUoe,
          isPending: false,
        })),
      },
      getListeningTraining: {
        useQuery: vi.fn(),
      },
      checkListeningTraining: {
        useMutation: vi.fn(() => ({
          mutateAsync: mockCheckListening,
          isPending: false,
        })),
      },
      getReadingTraining: {
        useQuery: vi.fn(),
      },
      checkReadingTraining: {
        useMutation: vi.fn(() => ({
          mutateAsync: mockCheckReading,
          isPending: false,
        })),
      },
      getWritingTraining: {
        useQuery: vi.fn(),
      },
      checkWritingTraining: {
        useMutation: vi.fn(() => ({
          mutateAsync: mockCheckWriting,
          isPending: false,
        })),
      },
      getTopicByTopicTitle: {
        useQuery: vi.fn(() => ({
          data: { id: 777 },
        })),
      },
      logResult: {
        useMutation: vi.fn(() => ({
          mutate: mockLogResult,
        })),
      },
    },
    useUtils: () => ({
      user: {
        getStreak: {
          invalidate: vi.fn(),
        },
      },
    }),
  },
}));

describe("Training Runners Integration Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UoERunner (Use of English Flow)", () => {
    it("should load task, allow typing answers, and verify results", async () => {
      const mockQuery = vi.spyOn(api.training.getUoeTraining, "useQuery");
      mockQuery.mockReturnValue({
        data: {
          topicTitle: "English Gaps Topic",
          tasks: [
            { id: 101, task: "RUN", origin: "He is _____________ fast." },
          ],
        },
        isLoading: false,
      } as any);

      mockCheckUoe.mockResolvedValue({
        correctCount: 1,
        total: 1,
        results: [{ id: 101, isCorrect: true, correctAnswer: "RUNNING" }],
      });

      render(<UoERunner />);

      expect(screen.getByText("English Gaps Topic")).toBeInTheDocument();
      expect(screen.getByText("He is _____________ fast.")).toBeInTheDocument();

      // Enter gap input
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "running" } });

      const checkBtn = screen.getByText("Проверить →");
      fireEvent.click(checkBtn);

      await waitFor(() => {
        expect(mockCheckUoe).toHaveBeenCalledWith({
          answers: [{ id: 101, answer: "RUNNING" }],
        });
      });

      // PostHog and logResult should be triggered
      expect(posthog.capture).toHaveBeenCalledWith(
        "training_completed",
        expect.any(Object),
      );
      expect(mockLogResult).toHaveBeenCalled();
    });

    it("should show loading spinner when data is fetching", () => {
      const mockQuery = vi.spyOn(api.training.getUoeTraining, "useQuery");
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      render(<UoERunner />);
      expect(screen.getByText("Загрузка задания...")).toBeInTheDocument();
    });

    it("should trim whitespace and uppercase the answer before checking", async () => {
      const mockQuery = vi.spyOn(api.training.getUoeTraining, "useQuery");
      mockQuery.mockReturnValue({
        data: {
          topicTitle: "English Gaps Topic",
          tasks: [
            { id: 101, task: "RUN", origin: "He is _____________ fast." },
          ],
        },
        isLoading: false,
      } as any);

      mockCheckUoe.mockResolvedValue({
        correctCount: 1,
        total: 1,
        results: [{ id: 101, isCorrect: true, correctAnswer: "RUNNING" }],
      });

      render(<UoERunner />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "   running   " } });

      const checkBtn = screen.getByText("Проверить →");
      fireEvent.click(checkBtn);

      await waitFor(() => {
        expect(mockCheckUoe).toHaveBeenCalledWith({
          answers: [{ id: 101, answer: "RUNNING" }],
        });
      });
    });
  });

  describe("ListeningRunner Flow", () => {
    it("should render multichoice options, submit answers, and display score", async () => {
      const mockQuery = vi.spyOn(api.training.getListeningTraining, "useQuery");
      mockQuery.mockReturnValue({
        data: {
          topicTitle: "Listening Topic",
          task: {
            id: 201,
            audioUrl: "test.mp3",
            questions: [
              {
                questionText: "Where is Bob?",
                options: ["Home", "School", "Work"],
              },
            ],
          },
        },
        isLoading: false,
      } as any);

      mockCheckListening.mockResolvedValue({
        correctCount: 1,
        total: 1,
        correctAnswers: [1],
        explanation: [{ text: "Bob is at Home." }],
      });

      render(<ListeningRunner />);

      expect(screen.getByText("Listening Topic")).toBeInTheDocument();
      expect(screen.getByText("Where is Bob?")).toBeInTheDocument();

      // Select first option
      const optionA = screen.getByText("Home");
      fireEvent.click(optionA);

      const checkBtn = screen.getByText("Проверить ответы →");
      fireEvent.click(checkBtn);

      await waitFor(() => {
        expect(mockCheckListening).toHaveBeenCalledWith({
          id: 201,
          answers: [1],
        });
      });
    });
  });

  describe("ReadingRunner Flow", () => {
    it("should implement match-headings interface selections", async () => {
      const mockQuery = vi.spyOn(api.training.getReadingTraining, "useQuery");
      mockQuery.mockReturnValue({
        data: {
          topicTitle: "Reading Matching Topic",
          task: {
            id: 301,
            headings: ["Heading 1", "Heading 2"],
            texts: ["Paragraph A details", "Paragraph B details"],
          },
        },
        isLoading: false,
      } as any);

      mockCheckReading.mockResolvedValue({
        correctCount: 2,
        total: 2,
        correctAnswers: [1, 2],
        explanation: [
          { text: "Matches correctly 1" },
          { text: "Matches correctly 2" },
        ],
      });

      render(<ReadingRunner />);

      expect(screen.getByText("Heading 1")).toBeInTheDocument();
      expect(screen.getByText("Paragraph A details")).toBeInTheDocument();

      // 1. Click heading 1 in bank
      const h1 = screen.getByText("Heading 1");
      fireEvent.click(h1);

      // 2. Click Paragraph A card to assign
      const textCards = screen.getAllByText(/details/);
      const cardA = textCards[0]!.closest("div");
      if (cardA) fireEvent.click(cardA);

      // 3. Click heading 2 in bank
      const h2 = screen.getByText("Heading 2");
      fireEvent.click(h2);

      // 4. Click Paragraph B card to assign
      const cardB = textCards[1]!.closest("div");
      if (cardB) fireEvent.click(cardB);

      const checkBtn = screen.getByText("Проверить ответы →");
      expect(checkBtn).not.toBeDisabled();
      fireEvent.click(checkBtn);

      await waitFor(() => {
        expect(mockCheckReading).toHaveBeenCalledWith({
          id: 301,
          answers: [1, 2],
        });
      });
    });
  });

  describe("WritingRunner Flow", () => {
    it("should render all sub-sections of writing exercises and submit answers", async () => {
      const mockQuery = vi.spyOn(api.training.getWritingTraining, "useQuery");
      mockQuery.mockReturnValue({
        data: {
          topicTitle: "Writing Topic",
          task: {
            structure: [{ id: 401, task: "Sentence 1\nSentence 2" }],
            cliches: [{ id: 402, options: ["Hello", "my", "friend"] }],
            linkers: [
              { id: 403, task: "Label 1", options: ["Option A"] },
              { id: 404, task: "Cloze gap text", options: ["GapOpt"] },
            ],
            fullAnswers: [
              {
                id: 405,
                question: "Question text?",
                options: ["A", "B", "C", "D", "E"],
              },
            ],
          },
        },
        isLoading: false,
      } as any);

      mockCheckWriting.mockResolvedValue({
        correctCount: 5,
        total: 5,
        structureCorrectness: [true, true],
        clichesCorrectness: [[true, true, true]],
        linkersCorrectness: [[true], [true]],
        fullAnswersCorrectness: [true],
      });

      render(<WritingRunner />);

      expect(screen.getByText("Раздел 4 · письмо")).toBeInTheDocument();

      // Check sections are present
      expect(screen.getByText("Sentence 1")).toBeInTheDocument();
      expect(screen.getByText("Hello")).toBeInTheDocument();
      expect(screen.getByText("Label 1")).toBeInTheDocument();
      expect(screen.getByText("Question text?")).toBeInTheDocument();

      const checkBtn = screen.getByText("Проверить →");
      fireEvent.click(checkBtn);

      await waitFor(() => {
        expect(mockCheckWriting).toHaveBeenCalled();
      });
    });
  });
});
