/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioTaskFormView } from "@/app/_components/admin/tasks/audio-task-form-view";
import { api } from "@/trpc/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/trpc/react", () => ({
  api: {
    admin: {
      getAudioTopics: { useQuery: vi.fn() },
      getAudioTaskById: { useQuery: vi.fn() },
      createAudioTask: { useMutation: vi.fn() },
      updateAudioTask: { useMutation: vi.fn() },
    },
  },
}));

describe("AudioTaskFormView", () => {
  beforeEach(() => {
    vi.mocked(api.admin.getAudioTopics.useQuery).mockReturnValue({
      data: [],
    } as any);
    vi.mocked(api.admin.getAudioTaskById.useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);
    vi.mocked(api.admin.createAudioTask.useMutation).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    } as any);
    vi.mocked(api.admin.updateAudioTask.useMutation).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads an audio file dropped onto the upload area", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "/uploads/audio/test.mp3" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AudioTaskFormView />);

    const dropZone = screen.getByText(/Перетащите аудиофайл/).parentElement!;
    const file = new File(["audio"], "test.mp3", { type: "audio/mpeg" });
    const dragWasNotCanceled = fireEvent.dragOver(dropZone, {
      dataTransfer: { files: [file], dropEffect: "none" },
    });
    const dropWasNotCanceled = fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(dragWasNotCanceled).toBe(false);
    expect(dropWasNotCanceled).toBe(false);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/upload-audio",
      expect.objectContaining({ method: "POST" }),
    );
    expect(
      await screen.findByDisplayValue("/uploads/audio/test.mp3"),
    ).toBeInTheDocument();
  });

  it("shows a useful message when the proxy returns an HTML 413 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 413,
        json: async () => {
          throw new SyntaxError("Unexpected token '<'");
        },
      }),
    );

    render(<AudioTaskFormView />);

    const dropZone = screen.getByText(/Перетащите аудиофайл/).parentElement!;
    const file = new File(["audio"], "test.mp3", { type: "audio/mpeg" });
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    expect(
      await screen.findByText(
        "Аудиофайл слишком большой. Максимальный размер — 20 МБ",
      ),
    ).toBeInTheDocument();
  });
});
