import Link from "next/link";
import clsx from "clsx";

type Topic = {
  id: number;
  title: string;
  category: string;
  isActive: boolean;
};

type MenuListItemProps = {
  topic: Topic;
  baseClickLink: string;
  isNotCompleted: boolean;
};

export function MenuListItem({
  topic,
  baseClickLink,
  isNotCompleted,
}: MenuListItemProps) {
  const itemClickLink = `${baseClickLink}?topic=${topic.id}`;

  const menuListItemContent = (
    <div
      className={clsx(
        "relative w-0 min-w-full overflow-hidden rounded-[16px] bg-surface p-8 text-ink-2 shadow-[2px_3px_10px_rgba(0,0,0,0.2)]",
        isNotCompleted
          ? "cursor-default bg-surface/40 pointer-events-none"
          : "cursor-pointer [&:hover_p]:underline [&:hover_p]:decoration-ok [&:hover_p]:underline-offset-4",
      )}
    >
      <p className="text-[24px] font-bold leading-[28px]">{topic.title}</p>
      {isNotCompleted && (
        <span className="text-err absolute right-6 bottom-3 font-extrabold">
          в разработке
        </span>
      )}
    </div>
  );

  return isNotCompleted ? (
    <div>{menuListItemContent}</div>
  ) : (
    <Link href={itemClickLink}>{menuListItemContent}</Link>
  );
}
