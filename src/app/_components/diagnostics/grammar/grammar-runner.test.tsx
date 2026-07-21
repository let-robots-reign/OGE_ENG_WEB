/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/unbound-method, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-return */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GrammarRunner } from "./grammar-runner";
import { api } from "@/trpc/react";
import posthog from "posthog-js";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

// Mock posthog-js
vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
    reset: vi.fn(),
  },
}));

// Mock global window methods
global.window.scrollTo = vi.fn();

// Mock tRPC Queries and Mutations
const mockCheckGrammar = vi.fn();
const mockLogResult = vi.fn();
const mockGetStreakInvalidate = vi.fn();

let checkGrammarOnSuccess: any = null;
let logResultOnSuccess: any = null;

vi.mock("@/trpc/react", () => ({
  api: {
    diagnostics: {
      hasCompletedDiagnostics: {
        useQuery: vi.fn(),
      },
      checkGrammar: {
        useMutation: vi.fn((options) => {
          checkGrammarOnSuccess = options?.onSuccess;
          return {
            mutate: (payload: any) => {
              mockCheckGrammar(payload);
              if (checkGrammarOnSuccess) {
                checkGrammarOnSuccess({
                  feedback:
                    "Mocked diagnostic feedback text CORRECT[excellent] INCORRECT[wrong]",
                });
              }
            },
            isPending: false,
            error: null,
          };
        }),
      },
    },
    training: {
      logResult: {
        useMutation: vi.fn((options) => {
          logResultOnSuccess = options?.onSuccess;
          return {
            mutate: (payload: any) => {
              mockLogResult(payload);
              if (logResultOnSuccess) {
                logResultOnSuccess();
              }
            },
            isPending: false,
          };
        }),
      },
    },
    useUtils: () => ({
      user: {
        getStreak: {
          invalidate: mockGetStreakInvalidate,
        },
      },
    }),
  },
}));

describe("GrammarRunner Component Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1", name: "John Doe" } },
      status: "authenticated",
    });
    vi.mocked(api.diagnostics.hasCompletedDiagnostics.useQuery).mockReturnValue(
      {
        data: false,
        isLoading: false,
      } as any,
    );
  });

  it("should render loading state when session is loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
    });

    render(<GrammarRunner />);
    expect(screen.getByText("Загрузка...")).toBeInTheDocument();
  });

  it("should render loading state when hasCompleted status is loading", () => {
    vi.mocked(api.diagnostics.hasCompletedDiagnostics.useQuery).mockReturnValue(
      {
        data: undefined,
        isLoading: true,
      } as any,
    );

    render(<GrammarRunner />);
    expect(screen.getByText("Загрузка...")).toBeInTheDocument();
  });

  it("should show auth modal for unauthenticated users", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<GrammarRunner />);
    expect(screen.getByText("Только для участников")).toBeInTheDocument();

    // Redirects to signin on click
    const loginButton = screen.getByRole("button", { name: "Войти" });
    fireEvent.click(loginButton);
    expect(mockPush).toHaveBeenCalledWith("/auth/signin");
  });

  it("should redirect home if user has already completed diagnostics", () => {
    vi.mocked(api.diagnostics.hasCompletedDiagnostics.useQuery).mockReturnValue(
      {
        data: true,
        isLoading: false,
      } as any,
    );

    render(<GrammarRunner />);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should render Part 1 questions and allow input changes", async () => {
    render(<GrammarRunner />);

    expect(screen.getByText("Формы слов")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Complete the sentences with the correct form of the word in brackets.",
      ),
    ).toBeInTheDocument();

    // Fill in a Part 1 blank input
    const inputs = screen.getAllByRole("textbox");
    // Part 1 question 1: "_____________ (not / touch) the dog! It has sharp _____________ (tooth)."
    // So it should have 2 inputs for index 0 and 1 of question 1.
    fireEvent.change(inputs[0]!, { target: { value: "don't touch" } });
    fireEvent.change(inputs[1]!, { target: { value: "teeth" } });

    expect(inputs[0]).toHaveValue("don't touch");
    expect(inputs[1]).toHaveValue("teeth");
  });

  it("should support navigation to Part 2 and back to Part 1", async () => {
    render(<GrammarRunner />);

    // Click Далее button
    const nextButton = screen.getByRole("button", { name: "Далее →" });
    fireEvent.click(nextButton);

    expect(screen.getByText("Перевод")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Translate the following sentences into English. Pay attention to the grammar topics in bold.",
      ),
    ).toBeInTheDocument();

    // Click Назад button
    const backButton = screen.getByRole("button", { name: "Назад" });
    fireEvent.click(backButton);

    expect(screen.getByText("Формы слов")).toBeInTheDocument();
  });

  it("should complete the workflow: fill answers, submit, and display results", async () => {
    render(<GrammarRunner />);

    // Part 1: fill first answer
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0]!, { target: { value: "don't touch" } });

    // Click Далее
    const nextButton = screen.getByRole("button", { name: "Далее →" });
    fireEvent.click(nextButton);

    // Part 2: fill first translation
    const textareas = screen.getAllByPlaceholderText("Введите ваш перевод...");
    fireEvent.change(textareas[0]!, {
      target: { value: "These people are my friends." },
    });

    // Click Submit
    const submitButton = screen.getByRole("button", {
      name: "Отправить на проверку →",
    });
    fireEvent.click(submitButton);

    // Check checkGrammar called
    expect(mockCheckGrammar).toHaveBeenCalled();

    // Check logResult called
    expect(mockLogResult).toHaveBeenCalledWith(
      expect.objectContaining({
        activityType: "diagnostics",
        activityId: 1,
      }),
    );

    // Check PostHog events captured
    expect(posthog.capture).toHaveBeenCalledWith(
      "diagnostics_submitted",
      expect.any(Object),
    );
    expect(posthog.capture).toHaveBeenCalledWith("diagnostics_completed", {
      diagnostics_type: "grammar",
    });

    // Check result view rendered
    expect(screen.getByText("Твой персональный разбор")).toBeInTheDocument();
    expect(
      screen.getByText("Mocked diagnostic feedback text"),
    ).toBeInTheDocument();
  });
});
