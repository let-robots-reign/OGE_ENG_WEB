import Link from "next/link";

interface FeaturedAllTopicsProps {
  topicId: number;
  desc: string;
}

export function FeaturedAllTopics({ topicId, desc }: FeaturedAllTopicsProps) {
  return (
    <Link
      href={`/training/use-of-english?topic=${topicId}`}
      className="bg-ink-panel mb-6 grid grid-cols-1 items-start gap-6 rounded-lg px-6 py-7 text-white transition-opacity hover:opacity-95 sm:px-10 sm:py-9 lg:grid-cols-[1.4fr_auto] lg:items-center lg:gap-10"
    >
      <div>
        <div
          className="mb-2.5 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          <span className="bg-accent-2 h-1.5 w-1.5 rounded-full" />
          микс — все темы
        </div>
        <div className="font-display mt-2.5 text-[36px] leading-none tracking-[-0.025em] text-white sm:text-[48px] lg:text-[56px]">
          По всем темам
        </div>
        <p
          className="mt-3.5 max-w-[520px] text-[15px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          {desc}
        </p>
      </div>

      <div className="flex flex-col items-stretch gap-[18px] lg:items-end">
        <div
          className="rounded-pill inline-flex h-[52px] items-center justify-center px-6 text-[16px] font-medium"
          style={{ background: "#fff", color: "#0a1733" }}
        >
          Начать микс →
        </div>
      </div>
    </Link>
  );
}
