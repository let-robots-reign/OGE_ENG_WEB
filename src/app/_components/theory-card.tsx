import Image from "next/image";
interface TheoryCardProps {
  title: string;
  image: string;
}

export function TheoryCard({ title, image }: TheoryCardProps) {
  return (
    <div className="relative mb-4 grid w-0 min-w-full cursor-pointer grid-cols-[1fr_2fr] items-center overflow-hidden rounded-[16px] bg-surface p-4 text-ink-2 shadow-[2px_3px_10px_rgba(0,0,0,0.2)] transition-shadow hover:shadow-[inset_0_0_2px_2px_#3eaf7c] max-[650px]:mx-auto max-[650px]:max-w-[350px]">
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
    </div>
  );
}
