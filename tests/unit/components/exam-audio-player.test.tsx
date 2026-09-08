import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExamAudioPlayer } from "@/app/_components/mock-exams/exam-audio-player";

describe("ExamAudioPlayer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("plays exactly twice and starts the repeat after five seconds", async () => {
    vi.useFakeTimers();
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined);
    render(<ExamAudioPlayer src="/test.mp3" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /первое/ }));
    });
    expect(play).toHaveBeenCalledTimes(1);
    const audio = document.querySelector("audio")!;
    fireEvent.ended(audio);
    expect(screen.getByText(/Повтор через 5/)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(play).toHaveBeenCalledTimes(2);
    fireEvent.ended(audio);
    expect(screen.getByText("Прослушивания завершены")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /первое/ })).toBeDisabled();
    play.mockRestore();
  });

  it("does not expose native controls", () => {
    render(<ExamAudioPlayer src="/test.mp3" />);
    expect(document.querySelector("audio")).not.toHaveAttribute("controls");
    expect(screen.queryByText(/1×/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /пауза/i }),
    ).not.toBeInTheDocument();
  });

  it("reports playback and the automatic gap as busy", async () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const onPlaybackStateChange = vi.fn();
    render(
      <ExamAudioPlayer
        src="/test.mp3"
        onPlaybackStateChange={onPlaybackStateChange}
      />,
    );

    expect(onPlaybackStateChange).toHaveBeenLastCalledWith(false);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /первое/ }));
    });
    expect(onPlaybackStateChange).toHaveBeenLastCalledWith(true);

    const audio = document.querySelector("audio")!;
    fireEvent.ended(audio);
    expect(onPlaybackStateChange).toHaveBeenLastCalledWith(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    fireEvent.ended(audio);
    expect(onPlaybackStateChange).toHaveBeenLastCalledWith(false);
  });

  it("retries the failed second playback without resetting to the first", async () => {
    vi.useFakeTimers();
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined);
    render(<ExamAudioPlayer src="/test.mp3" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /первое/ }));
    });
    const audio = document.querySelector("audio")!;
    fireEvent.ended(audio);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    fireEvent.error(audio);

    expect(
      screen.getByRole("button", { name: "Повторить второе прослушивание" }),
    ).toBeEnabled();
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Повторить второе прослушивание",
        }),
      );
    });
    fireEvent.ended(audio);

    expect(play).toHaveBeenCalledTimes(3);
    expect(screen.getByText("Прослушивания завершены")).toBeInTheDocument();
    play.mockRestore();
  });
});
