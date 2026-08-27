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
const mockSubmitAnswers = vi.fn();

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
      submitAnswers: {
        useMutation: vi.fn(() => ({
          mutate: mockSubmitAnswers,
        })),
      },
    },
    useUtils: () => ({
      user: {
        getStreak: {
          invalidate: vi.fn(),
        },
        getActivity: {
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

      // PostHog and submitAnswers should be triggered
      expect(posthog.capture).toHaveBeenCalledWith(
        "training_completed",
        expect.any(Object),
      );
      expect(mockSubmitAnswers).toHaveBeenCalled();
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
            audioUrl: "/audio/topic1/test.mp3",
            total: 1,
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
        results: [true],
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

    it("should render matching task 5 rubrics and submit speaker answers A-E", async () => {
      const mockQuery = vi.spyOn(api.training.getListeningTraining, "useQuery");
      mockQuery.mockReturnValue({
        data: {
          topicTitle: "Listening Task 5 Topic",
          task: {
            id: 202,
            taskType: "matching",
            audioUrl: "/audio/topic1/test5.mp3",
            // Six rubrics, but only five speakers to answer for.
            total: 5,
            questions: [
              "1. Individual and economical",
              "2. Varied and spicy",
              "3. Enjoyable and unifying",
              "4. Creative and engaging",
              "5. Healthy and nutritious",
              "6. Stressful and time-consuming",
            ],
          },
        },
        isLoading: false,
      } as any);

      mockCheckListening.mockResolvedValue({
        correctCount: 5,
        total: 5,
        correctAnswers: [1, 2, 3, 4, 5],
        results: Array(5).fill(true),
        explanation: Array(5).fill({ text: "Explanation" }),
      });

      render(<ListeningRunner />);

      expect(screen.getByText("Listening Task 5 Topic")).toBeInTheDocument();
      expect(
        screen.getByText("1. Individual and economical"),
      ).toBeInTheDocument();

      const selects = screen.getAllByRole("combobox");
      expect(selects).toHaveLength(5);

      fireEvent.change(selects[0]!, { target: { value: "1" } });
      fireEvent.change(selects[1]!, { target: { value: "2" } });
      fireEvent.change(selects[2]!, { target: { value: "3" } });
      fireEvent.change(selects[3]!, { target: { value: "4" } });
      fireEvent.change(selects[4]!, { target: { value: "5" } });

      const checkBtn = screen.getByText("Проверить ответы →");
      fireEvent.click(checkBtn);

      await waitFor(() => {
        expect(mockCheckListening).toHaveBeenCalledWith({
          id: 202,
          answers: [1, 2, 3, 4, 5],
        });
      });
    });

    it("should render gap_fill tasks 6-11 and submit upper-case trimmed answers", async () => {
      const mockQuery = vi.spyOn(api.training.getListeningTraining, "useQuery");
      mockQuery.mockReturnValue({
        data: {
          topicTitle: "Listening Tasks 6-11 Topic",
          task: {
            id: 203,
            taskType: "gap_fill",
            audioUrl: "/audio/topic1/test6.mp3",
            total: 6,
            questions: [
              "Age of the respondent ______________________ years old",
              "Date of birth ____________________, 30th, 2004",
              "Favourite sports activity _____________________________",
              "The school subject he/she is good at _______",
              "Foreign language(s) __________________________",
              "Career plans _________________________",
            ],
          },
        },
        isLoading: false,
      } as any);

      mockCheckListening.mockResolvedValue({
        correctCount: 6,
        total: 6,
        correctAnswers: [
          "FIFTEEN",
          "MAY",
          "SWIMMING",
          "MATHS",
          "FRENCH",
          "DOCTOR",
        ],
        results: Array(6).fill(true),
        explanation: Array(6).fill({ text: "Explanation" }),
      });

      render(<ListeningRunner />);

      expect(
        screen.getByText("Listening Tasks 6-11 Topic"),
      ).toBeInTheDocument();
      expect(screen.getByText("Age of the respondent")).toBeInTheDocument();

      const inputs = screen.getAllByRole("textbox");
      expect(inputs).toHaveLength(6);

      fireEvent.change(inputs[0]!, { target: { value: "fifteen" } });
      fireEvent.change(inputs[1]!, { target: { value: "may" } });
      fireEvent.change(inputs[2]!, { target: { value: "swimming" } });
      fireEvent.change(inputs[3]!, { target: { value: "maths" } });
      fireEvent.change(inputs[4]!, { target: { value: "french" } });
      fireEvent.change(inputs[5]!, { target: { value: "doctor" } });

      const checkBtn = screen.getByText("Проверить ответы →");
      fireEvent.click(checkBtn);

      await waitFor(() => {
        expect(mockCheckListening).toHaveBeenCalledWith({
          id: 203,
          answers: ["FIFTEEN", "MAY", "SWIMMING", "MATHS", "FRENCH", "DOCTOR"],
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
            taskType: "matching",
            headings: ["Heading 1", "Heading 2"],
            texts: ["Paragraph A details", "Paragraph B details"],
            answers: [1, 2],
            explanations: [],
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

    it("should implement true/false/not-stated selections", async () => {
      const mockQuery = vi.spyOn(api.training.getReadingTraining, "useQuery");
      mockQuery.mockReturnValue({
        data: {
          topicTitle: "Задания 13-19",
          task: {
            id: 302,
            taskType: "true_false",
            text: "Cambridge University is the second-oldest university.",
            statements: [
              "Cambridge was founded before Oxford.",
              "Citizens were happy about the university.",
            ],
            total: 2,
          },
        },
        isLoading: false,
      } as any);

      mockCheckReading.mockResolvedValue({
        correctCount: 1,
        total: 2,
        correctAnswers: [2, 3],
        results: [false, true],
        explanation: [
          { text: "The text says it is the second-oldest." },
          { text: "Not mentioned in the text." },
        ],
      });

      render(<ReadingRunner />);

      expect(
        screen.getByText("Cambridge was founded before Oxford."),
      ).toBeInTheDocument();

      // Select False for statement 1
      const falseButtons = screen.getAllByText("False");
      fireEvent.click(falseButtons[0]!);

      // Select Not stated for statement 2
      const nsButtons = screen.getAllByText("Not stated");
      fireEvent.click(nsButtons[1]!);

      const checkBtn = screen.getByText("Проверить ответы →");
      expect(checkBtn).not.toBeDisabled();
      fireEvent.click(checkBtn);

      await waitFor(() => {
        expect(mockCheckReading).toHaveBeenCalledWith({
          id: 302,
          answers: [2, 3],
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
