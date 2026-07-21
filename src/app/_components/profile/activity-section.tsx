"use client";

import { api } from "@/trpc/react";
import { SectionEyebrow } from "./section-eyebrow";
import { pluralizeDays } from "@/app/_utils/pluralize";

const WEEKDAYS = ["", "Вт", "", "Чт", "", "Сб", ""];

// TODO(dark): levels 1–3 are light indigos (#d9d7ff/#a8a3ff/#6f66ff) that look
// harsh on the dark surface. Left unchanged to keep light mode identical; revisit
// with dark-aware intensity tokens. Empty (level 0) and full (level 4) already use
// flipping tokens.
const LEVEL_BG = [
  "var(--color-surface-2)",
  "#d9d7ff",
  "#a8a3ff",
  "#6f66ff",
  "var(--color-accent)",
];

function levelFromCount(count: number): number {
  if (count <= 0) return 0;
  if (count >= 4) return 4;
  return count;
}

function monthLabel(ymd: string): string {
  const label = new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(
    new Date(ymd + "T00:00:00Z"),
  );
  return label.charAt(0).toUpperCase() + label.slice(1).replace(".", "");
}

function FlameSVG({ num }: { num: number }) {
  return (
    <svg
      viewBox="0 0 120 140"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      style={{ filter: "drop-shadow(0 10px 22px rgba(255,91,58,0.4))" }}
    >
      <defs>
        <linearGradient id="pf-flame-outer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8a3a" />
          <stop offset="55%" stopColor="#ff5b3a" />
          <stop offset="100%" stopColor="#d43a1a" />
        </linearGradient>
        <linearGradient id="pf-flame-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd84d" />
          <stop offset="100%" stopColor="#ff8a3a" />
        </linearGradient>
        <filter
          id="pf-flame-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="0"
            floodColor="#7a1500"
            floodOpacity="0.45"
          />
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="6"
            floodColor="#5a0e00"
            floodOpacity="0.35"
          />
        </filter>
      </defs>
      <path
        d="M60 6 C72 30, 96 38, 100 70 C104 102, 84 132, 60 132 C36 132, 16 102, 20 70 C24 50, 40 50, 48 38 C54 30, 56 22, 60 6 Z"
        fill="url(#pf-flame-outer)"
      />
      <path
        d="M60 40 C68 56, 82 64, 82 84 C82 104, 72 122, 60 122 C48 122, 38 104, 38 84 C38 70, 48 64, 54 56 C58 50, 58 46, 60 40 Z"
        fill="url(#pf-flame-inner)"
      />
      <text
        x="60"
        y="104"
        textAnchor="middle"
        className="font-sans"
        fontWeight="700"
        fontSize="42"
        fill="#fff"
        letterSpacing="-1"
        filter="url(#pf-flame-shadow)"
        style={{ fontFeatureSettings: '"tnum", "lnum"' }}
      >
        {num}
      </text>
    </svg>
  );
}

export function ActivitySection() {
  const timeZone =
    typeof Intl !== "undefined"
      ? (Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Europe/Moscow")
      : "Europe/Moscow";

  const { data } = api.user.getActivity.useQuery({ timeZone, weeks: 16 });

  const totalHours = data ? Math.round(data.totalSeconds / 3600) : 0;

  return (
    <section className="mb-[72px]">
      <div className="mb-5 flex items-end justify-between">
        <SectionEyebrow>01 — регулярность</SectionEyebrow>
        <div className="text-ink-3 font-mono text-[12.5px]">
          {data ? `${data.totalActiveDays} дней · ${data.weeks} недель` : " "}
        </div>
      </div>

      <div className="border-line bg-surface grid grid-cols-1 items-center gap-7 rounded-lg border p-5 sm:p-8 lg:grid-cols-[auto_1fr] lg:gap-8">
        {!data ? (
          <div className="text-ink-3 grid h-[180px] place-items-center text-[14px] lg:col-span-2">
            Загрузка активности...
          </div>
        ) : (
          <>
            {/* Streak callout */}
            <div className="border-line flex flex-col items-start gap-[18px] border-b pb-6 lg:border-r lg:border-b-0 lg:pr-8 lg:pb-0">
              <div className="grid h-40 w-[140px] place-items-center">
                <FlameSVG num={data.currentStreak} />
              </div>
              <div>
                <div className="font-display text-ink text-[26px] leading-[1.15] tracking-[-0.02em]">
                  Серия {data.currentStreak} {pluralizeDays(data.currentStreak)}
                </div>
                <div className="text-ink-3 mt-1.5 max-w-[220px] text-[13.5px] leading-[1.4]">
                  {data.currentStreak === 0
                    ? "Самое время начать — выполните задание сегодня."
                    : data.isActiveToday
                      ? "Сегодня уже занимались. Не теряйте темп!"
                      : "Сегодня ещё не занимались — вернитесь, чтобы продолжить серию."}
                </div>
              </div>
              <div
                className="rounded-pill inline-flex items-center gap-2 px-3 py-1.5 text-[12.5px] font-medium"
                style={{
                  background: "var(--color-accent-2-soft)",
                  color: "var(--color-accent-2)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--color-accent-2)" }}
                />
                лучшая серия — {data.bestStreak}{" "}
                {pluralizeDays(data.bestStreak)}
              </div>
            </div>

            {/* Heatmap */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[auto_1fr] gap-0">
                <div className="flex flex-col pr-2.5">
                  <div style={{ height: 18 }} />
                  <div
                    className="text-ink-4 grid flex-1 items-center gap-1 font-mono text-[10.5px] tracking-[0.06em]"
                    style={{ gridTemplateRows: "repeat(7, 1fr)" }}
                  >
                    {WEEKDAYS.map((w, i) => (
                      <div key={i}>{w}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div
                    className="text-ink-4 mb-2 grid gap-1 font-mono text-[10.5px] tracking-[0.08em] uppercase"
                    style={{ gridAutoFlow: "column", gridAutoColumns: "1fr" }}
                  >
                    {Array.from({ length: data.weeks }, (_, c) => {
                      const first = data.days[c * 7];
                      const prev = c > 0 ? data.days[(c - 1) * 7] : undefined;
                      const firstMonth = first?.ymd.slice(0, 7);
                      const prevMonth = prev?.ymd.slice(0, 7);
                      const show = !!firstMonth && firstMonth !== prevMonth;
                      return (
                        <div key={c}>
                          {show && first ? monthLabel(first.ymd) : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className="grid gap-1"
                    style={{
                      gridAutoFlow: "column",
                      gridTemplateRows: "repeat(7, 1fr)",
                      gridAutoColumns: "1fr",
                      width: "100%",
                    }}
                  >
                    {data.days.map((d, i) => {
                      const lvl = d.isFuture ? 0 : levelFromCount(d.count);
                      const isToday = i === data.todayIndex;
                      return (
                        <div
                          key={d.ymd}
                          title={
                            d.isFuture
                              ? ""
                              : d.count > 0
                                ? `${d.ymd}: ${Math.round(d.seconds / 60)} мин`
                                : `${d.ymd}: —`
                          }
                          style={{
                            aspectRatio: "1",
                            borderRadius: 4,
                            background: LEVEL_BG[lvl],
                            border: isToday
                              ? "1px solid var(--color-ink)"
                              : "1px solid transparent",
                            opacity: d.isFuture ? 0.5 : 1,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-ink-3 font-mono text-[11px] tracking-[0.08em] uppercase">
                  всего · {totalHours} ч за {data.weeks} недель
                </div>
                <div className="text-ink-3 flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] uppercase">
                  <span>меньше</span>
                  {LEVEL_BG.map((bg, i) => (
                    <span
                      key={i}
                      className="h-3 w-3 rounded-[3px]"
                      style={{ background: bg }}
                    />
                  ))}
                  <span>больше</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
