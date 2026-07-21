import Link from "next/link";
import { IconArrow } from "./icons";

interface TheoryCardProps {
  title: string;
  desc: string;
  chip: string;
  href: string;
}

export function TheoryCard({ title, desc, chip, href }: TheoryCardProps) {
  return (
    <Link
      href={href}
      className="group bg-surface border-line flex min-h-[200px] flex-col justify-between gap-[18px] rounded-lg border p-[26px] no-underline transition-shadow hover:shadow-md"
    >
      <span className="rounded-pill bg-accent-soft text-accent inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] uppercase">
        {chip}
      </span>
      <div>
        <div className="font-display mb-2 text-[26px] leading-[1.1] tracking-[-0.02em]">
          {title}
        </div>
        <div className="text-ink-3 text-[14px] leading-[1.45]">{desc}</div>
      </div>
      <div className="flex justify-end">
        <div className="bg-surface-2 text-ink-2 grid h-9 w-9 place-items-center rounded-full transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-[-12deg]">
          <IconArrow />
        </div>
      </div>
    </Link>
  );
}
