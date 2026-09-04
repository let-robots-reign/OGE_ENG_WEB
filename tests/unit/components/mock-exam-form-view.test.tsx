/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockExamFormView } from "@/app/_components/admin/mock-exams/mock-exam-form-view";
import { api } from "@/trpc/react";

const mutate = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/trpc/react", () => ({
  api: {
    useUtils: () => ({
      admin: { getMockExams: { invalidate: vi.fn() } },
      mockExams: { list: { invalidate: vi.fn() } },
    }),
    admin: {
      getMockExamOptions: { useQuery: vi.fn() },
      getMockExamById: { useQuery: vi.fn() },
      createMockExam: { useMutation: vi.fn() },
      updateMockExam: { useMutation: vi.fn() },
    },
  },
}));

describe("MockExamFormView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.admin.getMockExamOptions.useQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(api.admin.getMockExamById.useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);
    vi.mocked(api.admin.createMockExam.useMutation).mockReturnValue({
      mutate,
      isPending: false,
    } as any);
    vi.mocked(api.admin.updateMockExam.useMutation).mockReturnValue({
      mutate,
      isPending: false,
    } as any);
  });

  it("shows a readable error when the order field is cleared", () => {
    render(<MockExamFormView />);

    fireEvent.change(screen.getByLabelText("Название"), {
      target: { value: "Вариант 1" },
    });
    fireEvent.change(screen.getByLabelText("Порядок"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(
      screen.getByText("Порядок должен быть целым положительным числом."),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });
});
