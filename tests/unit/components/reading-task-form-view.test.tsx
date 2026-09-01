/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReadingTaskFormView } from "@/app/_components/admin/tasks/reading-task-form-view";
import { api } from "@/trpc/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/trpc/react", () => ({
  api: {
    admin: {
      getReadingTopics: { useQuery: vi.fn() },
      getReadingTaskById: { useQuery: vi.fn() },
      createReadingTask: { useMutation: vi.fn() },
      updateReadingTask: { useMutation: vi.fn() },
    },
  },
}));

describe("ReadingTaskFormView", () => {
  beforeEach(() => {
    vi.mocked(api.admin.getReadingTopics.useQuery).mockReturnValue({
      data: [{ id: 1, title: "Задание 12" }],
    } as any);
    vi.mocked(api.admin.getReadingTaskById.useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);
    vi.mocked(api.admin.createReadingTask.useMutation).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    } as any);
    vi.mocked(api.admin.updateReadingTask.useMutation).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    } as any);
  });

  it("does not reserve headings for passages without a selected answer", async () => {
    render(<ReadingTaskFormView />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "-- Выберите тему из списка --",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Задание 12" }));

    for (let index = 1; index <= 7; index++) {
      fireEvent.change(
        await screen.findByPlaceholderText(`Заголовок ${index}...`),
        { target: { value: `Heading ${index}` } },
      );
    }

    fireEvent.click(
      screen.getAllByRole("button", { name: "Выберите заголовок..." })[0]!,
    );

    for (let index = 1; index <= 7; index++) {
      expect(
        screen.getByRole("button", { name: `${index}. Heading ${index}` }),
      ).toBeEnabled();
    }
  });
});
