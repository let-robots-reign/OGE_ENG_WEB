import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  student: "Ученик",
  teacher: "Учитель",
  admin: "Администратор",
};

function formatMemberSince(date: Date | null): string | null {
  if (!date) return null;
  const month = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(
    date,
  );
  return `${month} ${date.getFullYear()}`;
}

function DisplayName({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return <>{name}</>;
  const head = parts.slice(0, -1).join(" ");
  const tail = parts[parts.length - 1];
  return (
    <>
      {head} {tail}
    </>
  );
}

interface IdentityHeroProps {
  name: string | null;
  email: string;
  initials: string;
  emailVerified: Date | null;
  role: string | null;
}

export function IdentityHero({
  name,
  email,
  initials,
  emailVerified,
  role,
}: IdentityHeroProps) {
  const displayName = name?.trim() ?? email.split("@")[0] ?? "Профиль";
  const memberSince = formatMemberSince(emailVerified);
  const roleLabel = role ? ROLE_LABELS[role] : null;

  const meta: { term: string; value: string }[] = [];
  if (memberSince) meta.push({ term: "с нами с", value: memberSince });
  meta.push({ term: "e-mail", value: email });
  if (roleLabel) meta.push({ term: "статус", value: roleLabel });

  return (
    <div className="border-line bg-surface mb-10 grid grid-cols-1 items-center gap-6 rounded-lg border p-6 sm:mb-14 sm:grid-cols-[auto_1fr] sm:gap-8 sm:p-9">
      <div className="relative">
        <div
          className="font-display relative grid h-[120px] w-[120px] place-items-center rounded-full text-[56px] leading-none tracking-[-0.04em] text-white italic shadow-md sm:h-[168px] sm:w-[168px] sm:text-[78px]"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, #d8d4ff 0%, transparent 55%), linear-gradient(135deg, #6b62ff 0%, #2d22b3 100%)",
          }}
        >
          {initials}
          <span
            className="border-line pointer-events-none absolute rounded-full border"
            style={{ inset: -6 }}
          />
        </div>
        <Link
          href="#settings"
          aria-label="Редактировать профиль"
          className="border-line bg-surface text-ink-2 hover:bg-surface-2 absolute right-1 bottom-1 grid h-9 w-9 place-items-center rounded-full border shadow-sm transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 4.5l5 5L8 21H3v-5z" />
            <path d="M13 6l5 5" />
          </svg>
        </Link>
      </div>

      <div>
        <h1 className="font-display m-0 text-[36px] leading-[0.98] tracking-[-0.025em] sm:text-[56px]">
          <DisplayName name={displayName} />
        </h1>

        <dl className="text-ink-3 mt-[18px] flex flex-wrap gap-6 text-[13.5px]">
          {meta.map((m) => (
            <div key={m.term}>
              <dt className="text-ink-4 mb-1 font-mono text-[11px] tracking-[0.08em] uppercase">
                {m.term}
              </dt>
              <dd className="text-ink m-0 text-[14.5px] font-medium">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-[26px] flex flex-wrap gap-2.5">
          <Link
            href="#settings"
            className="rounded-pill bg-ink text-on-ink hover:bg-ink-hover inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium no-underline transition-colors"
          >
            Редактировать профиль
          </Link>
          {/* TODO: implement */}
          {/*<span className="rounded-pill border-line-2 text-ink-3 inline-flex h-11 cursor-default items-center justify-center border px-[22px] text-[15px] font-medium">*/}
          {/*  Поделиться прогрессом*/}
          {/*</span>*/}
        </div>
      </div>
    </div>
  );
}
