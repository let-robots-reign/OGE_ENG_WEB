import { InviteLink } from "./invite-link";

/** Small labelled statistic card used across the analytics tabs. */
export function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="border-line bg-surface rounded-lg border p-5">
      <div className="text-ink-4 font-mono text-[10.5px] tracking-[0.1em] uppercase">
        {label}
      </div>
      <div className="font-display mt-2 text-[34px] tracking-[-0.02em]">
        {value}
        {suffix != null && (
          <span className="text-ink-4 text-[19px]">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export function TabLoading() {
  return (
    <div className="border-line bg-surface text-ink-3 grid h-[200px] place-items-center rounded-lg border text-[14px]">
      Загрузка…
    </div>
  );
}

/** Empty-class state: no students yet. Leads with the invite link. */
export function ClassEmptyState({ inviteToken }: { inviteToken: string }) {
  return (
    <div className="border-line bg-surface flex flex-col items-center rounded-lg border px-6 py-16 text-center sm:py-[72px]">
      <span className="bg-accent-soft text-accent grid h-[76px] w-[76px] place-items-center rounded-full">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6M22 11h-6" />
        </svg>
      </span>
      <h2 className="font-display mt-5 text-[26px] tracking-[-0.02em] sm:text-[28px]">
        Пока никто не вступил в класс
      </h2>
      <p className="text-ink-3 mt-3 max-w-[420px] text-[15px] leading-[1.55]">
        Отправьте ссылку-приглашение ученикам. Как только они вступят, здесь
        появится их активность, средние баллы и результаты пробников.
      </p>
      <div className="mt-6 w-full max-w-[460px]">
        <InviteLink token={inviteToken} size="lg" copyLabel="Скопировать ссылку" />
      </div>
      <div className="text-ink-4 mt-3.5 text-[12.5px]">
        Вступить может любой, у кого есть ссылка. Лишнего ученика можно убрать из
        класса.
      </div>
    </div>
  );
}

/** Neutral in-tab empty state for tabs that have no data yet. */
export function TabEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-line bg-surface text-ink-3 rounded-lg border px-6 py-14 text-center text-[14.5px]">
      {children}
    </div>
  );
}
