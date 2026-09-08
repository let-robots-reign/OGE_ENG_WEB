import { displayName, formatLongDate, getInitials } from "./utils";

/**
 * Read-only identity hero for the teacher's view of a student. Mirrors the
 * profile `IdentityHero` visual language but drops all edit affordances and
 * carries a "только просмотр" badge.
 */
export function StudentProgressHero({
  name,
  email,
  joinedAt,
}: {
  name: string | null;
  email: string;
  joinedAt: Date;
}) {
  return (
    <div className="border-line bg-surface mt-4 grid grid-cols-1 items-center gap-6 rounded-lg border p-6 sm:grid-cols-[auto_1fr_auto] sm:gap-8 sm:p-8">
      <div
        className="font-display grid h-[92px] w-[92px] place-items-center rounded-full text-[40px] leading-none tracking-[-0.03em] text-white italic shadow-md sm:h-[104px] sm:w-[104px] sm:text-[44px]"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, #d8d4ff 0%, transparent 55%), linear-gradient(135deg, #6b62ff 0%, #2d22b3 100%)",
        }}
      >
        {getInitials(name, email)}
      </div>

      <div>
        <h1 className="font-display m-0 text-[32px] leading-[0.98] tracking-[-0.025em] sm:text-[40px]">
          {displayName(name, email)}
        </h1>
        <dl className="mt-4 flex flex-wrap gap-6 sm:gap-7">
          <div>
            <dt className="text-ink-4 mb-1 font-mono text-[11px] tracking-[0.08em] uppercase">
              e-mail
            </dt>
            <dd className="text-ink m-0 text-[14.5px] font-medium">{email}</dd>
          </div>
          <div>
            <dt className="text-ink-4 mb-1 font-mono text-[11px] tracking-[0.08em] uppercase">
              в классе с
            </dt>
            <dd className="text-ink m-0 text-[14.5px] font-medium">
              {formatLongDate(joinedAt)}
            </dd>
          </div>
        </dl>
      </div>

      <span className="rounded-pill bg-surface-2 text-ink-3 self-start px-3 py-1.5 text-[12px] font-medium">
        только просмотр
      </span>
    </div>
  );
}
