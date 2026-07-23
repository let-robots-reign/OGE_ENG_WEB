"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { api } from "@/trpc/react";

const tabsOptions = z.enum(["training", "diagnostics"]);
type Tab = z.infer<typeof tabsOptions>;

// Category pill tones mirror the subject tones used on home/profile.
const CATEGORY_META: Record<string, { label: string; bg: string; fg: string }> =
  {
    audio: {
      label: "Аудирование",
      bg: "var(--color-tone-indigo)",
      fg: "var(--color-tone-indigo-ink)",
    },
    reading: {
      label: "Чтение",
      bg: "var(--color-tone-warm)",
      fg: "var(--color-tone-warm-ink)",
    },
    "use-of-english": {
      label: "Языковой материал",
      bg: "var(--color-tone-mint)",
      fg: "var(--color-tone-mint-ink)",
    },
    writing: {
      label: "Письмо",
      bg: "var(--color-tone-sand)",
      fg: "var(--color-tone-sand-ink)",
    },
  };

const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" })
    .format(d)
    .replace(".", "");

const formatTime = (d: Date): string =>
  new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

const thClass =
  "bg-surface-2 px-5 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-4";
const tdClass = "border-b border-line px-5 py-4 align-middle text-[14.5px]";

function WhenCell({ date }: { date: Date }) {
  return (
    <>
      <div className="text-ink font-medium">{formatDate(date)}</div>
      <div className="text-ink-3 mt-0.5 font-mono text-[12.5px]">
        {formatTime(date)}
      </div>
    </>
  );
}

function UserCell({
  name,
  email,
}: {
  name: string | null;
  email: string | null;
}) {
  return (
    <>
      <div className="text-ink font-medium">{name ?? "—"}</div>
      <div className="text-ink-3 mt-0.5 text-[12.5px]">{email}</div>
    </>
  );
}

function ResultCell({ result }: { result: string }) {
  const match = /^(\d+)\s*\/\s*(\d+)$/.exec(result.trim());
  if (!match) {
    return result.trim() ? (
      <span className="text-ink-2 font-mono text-[13px]">{result}</span>
    ) : (
      <span className="text-ink-3 text-[13px]">—</span>
    );
  }
  return (
    <span className="font-display text-[19px] leading-none tracking-[-0.02em]">
      {match[1]}
      <span className="text-ink-3 text-[13px]"> / {match[2]}</span>
    </span>
  );
}

function StateRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="text-ink-3 px-5 py-10 text-center text-[14px]"
      >
        {children}
      </td>
    </tr>
  );
}

export function AdminView() {
  const searchParams = useSearchParams();

  const parsedTab = tabsOptions.safeParse(searchParams.get("tab"));
  const activeTab: Tab = parsedTab.success ? parsedTab.data : "training";

  const { data: trainingData, isLoading: isLoadingTraining } =
    api.admin.getTrainingResults.useQuery(undefined, {
      enabled: activeTab === "training",
    });

  const { data: diagnosticsData, isLoading: isLoadingDiagnostics } =
    api.admin.getDiagnosticsResults.useQuery(undefined, {
      enabled: activeTab === "diagnostics",
    });

  const rowCount =
    activeTab === "training" ? trainingData?.length : diagnosticsData?.length;

  return (
    <div className="px-2 pt-4 pb-16 sm:px-4 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-display text-[32px] leading-none tracking-[-0.03em] sm:text-[44px]">
              {activeTab === "training"
                ? "Результаты тренировок"
                : "Результаты диагностик"}
            </h1>
          </div>
          {rowCount != null && (
            <div className="text-ink-3 font-mono text-[13px]">
              {rowCount} записей
            </div>
          )}
        </div>

        {/* Tables */}
        <div className="border-line bg-surface overflow-x-auto rounded-lg border">
          {activeTab === "training" ? (
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  <th className={`${thClass} w-[110px]`}>Когда</th>
                  <th className={thClass}>Пользователь</th>
                  <th className={`${thClass} w-[190px]`}>Тренировка</th>
                  <th className={thClass}>Тема</th>
                  <th className={`${thClass} w-[120px]`}>Результат</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTraining ? (
                  <StateRow colSpan={5}>Загрузка данных...</StateRow>
                ) : !trainingData || trainingData.length === 0 ? (
                  <StateRow colSpan={5}>
                    Пока нет результатов тренировок.
                  </StateRow>
                ) : (
                  trainingData.map((r) => {
                    const meta = r.topic
                      ? CATEGORY_META[r.topic.category]
                      : undefined;
                    return (
                      <tr
                        key={r.id}
                        className="transition-colors hover:bg-[rgba(79,70,255,0.025)] last:[&>td]:border-b-0"
                      >
                        <td className={tdClass}>
                          <WhenCell date={r.createdAt} />
                        </td>
                        <td className={tdClass}>
                          <UserCell name={r.user.name} email={r.user.email} />
                        </td>
                        <td className={tdClass}>
                          {meta ? (
                            <span
                              className="rounded-pill px-2.5 py-1 text-[12px] font-medium whitespace-nowrap"
                              style={{ background: meta.bg, color: meta.fg }}
                            >
                              {meta.label}
                            </span>
                          ) : (
                            <span className="text-ink-3 text-[13px]">
                              {r.topic?.category ?? "—"}
                            </span>
                          )}
                        </td>
                        <td className={`${tdClass} text-ink`}>
                          {r.topic?.title ?? "—"}
                        </td>
                        <td className={tdClass}>
                          <ResultCell result={r.result} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className={`${thClass} w-[110px]`}>Когда</th>
                  <th className={thClass}>Пользователь</th>
                  <th className={`${thClass} w-[160px]`}></th>
                </tr>
              </thead>
              <tbody>
                {isLoadingDiagnostics ? (
                  <StateRow colSpan={3}>Загрузка данных...</StateRow>
                ) : !diagnosticsData || diagnosticsData.length === 0 ? (
                  <StateRow colSpan={3}>
                    Пока нет результатов диагностик.
                  </StateRow>
                ) : (
                  diagnosticsData.map((r) => (
                    <tr
                      key={r.id}
                      className="transition-colors hover:bg-[rgba(79,70,255,0.025)] last:[&>td]:border-b-0"
                    >
                      <td className={tdClass}>
                        <WhenCell date={r.createdAt} />
                      </td>
                      <td className={tdClass}>
                        <UserCell name={r.user.name} email={r.user.email} />
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <Link
                          href={`/admin/diagnostics/${r.id}`}
                          className="text-accent text-[14px] font-medium hover:underline"
                        >
                          Просмотреть →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
