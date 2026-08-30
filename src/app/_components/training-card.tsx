import Image from "next/image";
import clsx from "clsx";

interface TrainingCardProps {
  title: string;
  image: string;
  progress?: number;
  className?: string;
  isBeta?: boolean;
}

export function TrainingCard({
  title,
  image,
  className,
  isBeta,
}: TrainingCardProps) {
  return (
    <div
      className={clsx(
        "relative mb-4 grid w-0 min-w-full cursor-pointer items-center rounded-[16px] bg-surface p-4 text-ink-2 shadow-[2px_3px_10px_rgba(0,0,0,0.2)] transition-shadow hover:shadow-[inset_0_0_2px_2px_#3eaf7c] max-[650px]:mx-auto max-[650px]:max-w-[350px]",
        className,
      )}
    >
      <div>
        <Image
          className="block h-auto max-w-full"
          src={`/card-icons/${image}`}
          alt={title}
          width={80}
          height={80}
        />
      </div>
      <div className="ml-4 text-[18px] font-bold leading-[24px]">{title}</div>
      {isBeta && (
        <div className="bg-ok absolute -right-3 -bottom-3 rounded-3xl px-5 py-2 text-sm font-semibold text-white max-[650px]:-right-2.5 max-[650px]:-bottom-2.5 max-[650px]:px-4 max-[650px]:py-1.5 max-[650px]:text-xs">
          бета-версия
        </div>
      )}
    </div>
  );
}
