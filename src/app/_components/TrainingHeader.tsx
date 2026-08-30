import { BackButton } from "./BackButton";

type TrainingHeaderProps = {
  topic: string;
};

export function TrainingHeader({ topic }: TrainingHeaderProps) {
  return (
    <>
      <BackButton />
      <div className="relative mb-4 flex items-center justify-between overflow-hidden rounded-[16px] bg-surface p-6 shadow-[2px_3px_10px_rgba(0,0,0,0.2)] max-[676px]:flex-col max-[676px]:gap-3 max-[676px]:break-words">
        <p className="text-ink text-[2rem] font-bold max-[676px]:text-[1.3rem]">
          {topic}
        </p>
      </div>
    </>
  );
}
