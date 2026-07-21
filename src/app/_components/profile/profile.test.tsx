/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-type-assertion */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IdentityHero } from "./identity-hero";
import { SubjectCard } from "./subject-card";
import { SubjectProgress } from "./subject-progress";
import { HistoryTable } from "./history-table";
import { ActivitySection } from "./activity-section";
import { SettingsSection } from "./settings-section";
import { api } from "@/trpc/react";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

const mockMutate = vi.fn();
const mockInvalidate = vi.fn();

vi.mock("@/trpc/react", () => ({
  api: {
    user: {
      getActivity: {
        useQuery: vi.fn(),
      },
      updateProfile: {
        useMutation: vi.fn(() => ({
          mutate: mockMutate,
          isPending: false,
        })),
      },
    },
    useUtils: () => ({
      user: {
        getProfileHeader: {
          invalidate: mockInvalidate,
        },
      },
    }),
  },
}));

describe("Profile Components Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("IdentityHero", () => {
    it("should render user info, initials, and status", () => {
      render(
        <IdentityHero
          name="Иван Иванов"
          email="ivan@example.com"
          initials="ИИ"
          emailVerified={new Date("2026-03-01T00:00:00Z")}
          role="student"
        />,
      );

      expect(screen.getByText("ИИ")).toBeInTheDocument();
      expect(screen.getByText("Иван Иванов")).toBeInTheDocument();
      expect(screen.getByText("ivan@example.com")).toBeInTheDocument();
      expect(screen.getByText("Ученик")).toBeInTheDocument();
      expect(screen.getByText("март 2026")).toBeInTheDocument();
    });

    it("should fallback name to email part if name is null", () => {
      render(
        <IdentityHero
          name={null}
          email="alex@example.com"
          initials="A"
          emailVerified={null}
          role="teacher"
        />,
      );

      expect(screen.getByText("alex")).toBeInTheDocument();
      expect(screen.getByText("Учитель")).toBeInTheDocument();
    });
  });

  describe("SubjectCard & SubjectProgress", () => {
    it("should render subject statistics and progress bar width", () => {
      render(
        <SubjectCard
          title="Чтение"
          en="Reading"
          done={5}
          total={10}
          pct={50}
          avgCorrect={8}
          avgMax={10}
          tone={{ bg: "pink", ink: "red" }}
        />,
      );

      expect(screen.getByText("Чтение")).toBeInTheDocument();
      expect(screen.getByText("Reading")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText(/средн\. 8\/10/)).toBeInTheDocument();
    });

    it("should render subjects grid in SubjectProgress", () => {
      const subjects = [
        {
          key: "audio" as const,
          done: 1,
          total: 5,
          pct: 20,
          avgCorrect: 2,
          avgMax: 3,
        },
        {
          key: "reading" as const,
          done: 0,
          total: 5,
          pct: 0,
          avgCorrect: 0,
          avgMax: 0,
        },
      ];

      render(<SubjectProgress subjects={subjects} />);
      expect(screen.getByText("Аудирование")).toBeInTheDocument();
      expect(screen.getByText("Чтение")).toBeInTheDocument();
      expect(screen.getByText("20%")).toBeInTheDocument();
      expect(screen.getByText("0%")).toBeInTheDocument();
    });
  });

  describe("HistoryTable", () => {
    it("should show empty row message if list is empty", () => {
      render(<HistoryTable rows={[]} />);
      expect(screen.getByText(/Пока нет действий/)).toBeInTheDocument();
    });

    it("should render list of activity rows with correct duration formatting", () => {
      const rows = [
        {
          id: 1,
          createdAt: new Date("2026-06-15T12:30:00Z"),
          kind: "Аудирование",
          tone: "ok" as const,
          title: "Задание 1. Разговор",
          timeSpent: 95, // ~2 min
          correct: 4,
          max: 5,
        },
        {
          id: 2,
          createdAt: new Date("2026-06-15T14:45:00Z"),
          kind: "Чтение",
          tone: "warn" as const,
          title: "Сложный текст",
          timeSpent: 3600, // 60 min -> 1 h
          correct: 1,
          max: 5,
        },
      ];

      render(<HistoryTable rows={rows} />);
      expect(screen.getByText("Задание 1. Разговор")).toBeInTheDocument();
      expect(screen.getByText("Сложный текст")).toBeInTheDocument();
      expect(screen.getByText("2 м")).toBeInTheDocument();
      expect(screen.getByText("1 ч")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  describe("ActivitySection", () => {
    it("should render loading state when query has no data", () => {
      const mockUseQuery = vi.spyOn(api.user.getActivity, "useQuery");
      mockUseQuery.mockReturnValue({ data: null, isLoading: true } as any);

      render(<ActivitySection />);
      expect(screen.getByText("Загрузка активности...")).toBeInTheDocument();
    });

    it("should render heatmap grid, streak counts, and stats header", () => {
      const mockUseQuery = vi.spyOn(api.user.getActivity, "useQuery");
      mockUseQuery.mockReturnValue({
        data: {
          currentStreak: 5,
          bestStreak: 12,
          isActiveToday: true,
          totalActiveDays: 8,
          totalSeconds: 3600 * 2.4, // 2.4 hours -> ~2h
          weeks: 16,
          todayIndex: 111,
          days: Array.from({ length: 16 * 7 }, (_, i) => {
            const date = new Date(Date.UTC(2026, 0, 1 + i));
            return {
              ymd: date.toISOString().slice(0, 10),
              count: i === 5 ? 3 : 0,
              seconds: i === 5 ? 120 : 0,
              isFuture: false,
            };
          }),
        },
        isLoading: false,
      } as any);

      render(<ActivitySection />);
      expect(screen.getByText("Серия 5 дней")).toBeInTheDocument();
      expect(
        screen.getByText("Сегодня уже занимались. Не теряйте темп!"),
      ).toBeInTheDocument();
      expect(screen.getByText("лучшая серия — 12 дней")).toBeInTheDocument();
      expect(screen.getByText("всего · 2 ч за 16 недель")).toBeInTheDocument();
    });

    it("should render encouragement message if user has 0 day streak and is not active today", () => {
      const mockUseQuery = vi.spyOn(api.user.getActivity, "useQuery");
      mockUseQuery.mockReturnValue({
        data: {
          currentStreak: 0,
          bestStreak: 12,
          isActiveToday: false,
          totalActiveDays: 8,
          totalSeconds: 3600 * 2.4,
          weeks: 16,
          todayIndex: 111,
          days: [],
        },
        isLoading: false,
      } as any);

      render(<ActivitySection />);
      expect(
        screen.getByText("Самое время начать — выполните задание сегодня."),
      ).toBeInTheDocument();
    });
  });

  describe("SettingsSection", () => {
    const initialData = {
      name: "Петр Петров",
      email: "peter@example.com",
      telegramUsername: "peter_tg",
      school: "Школа 123",
      examPointsGoal: 32,
      notificationsWeekly: true,
      notificationsMarketing: false,
    };

    it("should fill fields with initial data and handle save triggers", async () => {
      const mockUseMutation = vi.spyOn(api.user.updateProfile, "useMutation");
      const mockMutateFn = vi.fn();
      mockUseMutation.mockReturnValue({
        mutate: mockMutateFn,
        isPending: false,
      } as any);

      render(<SettingsSection initialData={initialData} />);

      const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
      const firstInput = inputs[0]!; // имя
      const lastInput = inputs[1]!; // фамилия
      expect(firstInput.value).toBe("Петр");
      expect(lastInput.value).toBe("Петров");

      // Edit name
      fireEvent.change(firstInput, { target: { value: "Дмитрий" } });

      const saveBtn = screen.getByText("Сохранить");
      fireEvent.click(saveBtn);

      expect(mockMutateFn).toHaveBeenCalledWith({
        name: "Дмитрий Петров",
        email: "peter@example.com",
        telegramUsername: "peter_tg",
        school: "Школа 123",
        examPointsGoal: 32,
        notificationsWeekly: true,
        notificationsMarketing: false,
      });
    });

    it("should handle form reset correctly", () => {
      render(<SettingsSection initialData={initialData} />);

      const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
      const firstInput = inputs[0]!; // имя
      fireEvent.change(firstInput, { target: { value: "Сергей" } });
      expect(firstInput.value).toBe("Сергей");

      const cancelBtn = screen.getByText("Отменить");
      fireEvent.click(cancelBtn);

      expect(firstInput.value).toBe("Петр");
    });

    it("should validate empty name fields locally and block submit", () => {
      const mockUseMutation = vi.spyOn(api.user.updateProfile, "useMutation");
      const mockMutateFn = vi.fn();
      mockUseMutation.mockReturnValue({
        mutate: mockMutateFn,
        isPending: false,
      } as any);

      render(<SettingsSection initialData={initialData} />);

      const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
      const firstInput = inputs[0]!; // имя
      const lastInput = inputs[1]!; // фамилия

      // Clear both name inputs
      fireEvent.change(firstInput, { target: { value: "" } });
      fireEvent.change(lastInput, { target: { value: "" } });

      const saveBtn = screen.getByText("Сохранить");
      fireEvent.click(saveBtn);

      // Verify that local error is raised and mutate is not called
      expect(screen.getByText("Укажите имя.")).toBeInTheDocument();
      expect(mockMutateFn).not.toHaveBeenCalled();
    });
  });
});
