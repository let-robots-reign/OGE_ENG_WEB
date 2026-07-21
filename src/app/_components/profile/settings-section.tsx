"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { SectionEyebrow } from "./section-eyebrow";

const inputClass =
  "h-12 w-full rounded-sm border border-line-2 bg-surface px-4 text-[15px] text-ink outline-none transition-colors focus:border-ink";
const labelClass =
  "font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3";

const selectStyle: React.CSSProperties = {
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7493' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 16px center",
  paddingRight: 40,
};

function Field({
  label,
  children,
  fullWidth,
}: {
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 ${fullWidth ? "sm:col-span-2" : ""}`}
    >
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  on,
  onToggle,
  label,
  sub,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  sub: string;
}) {
  return (
    <div className="border-line flex items-center justify-between border-b py-[18px] last:border-b-0">
      <div>
        <div className="text-[14.5px] font-medium">{label}</div>
        <div className="text-ink-3 mt-0.5 text-[12.5px]">{sub}</div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        aria-pressed={on}
        className="rounded-pill relative h-7 w-[46px] shrink-0 transition-colors"
        style={{
          background: on ? "var(--color-accent)" : "var(--color-line-2)",
        }}
      >
        <span
          className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-[left]"
          style={{
            left: on ? 21 : 3,
            boxShadow:
              "0 1px 3px rgba(10,23,51,0.18), 0 1px 1px rgba(10,23,51,0.06)",
          }}
        />
      </button>
    </div>
  );
}

interface SettingsSectionProps {
  initialData: {
    name: string | null;
    email: string;
    telegramUsername?: string | null;
    school?: string | null;
    examPointsGoal?: number | null;
    notificationsWeekly?: boolean;
    notificationsMarketing?: boolean;
  };
}

export function SettingsSection({ initialData }: SettingsSectionProps) {
  const initialName = initialData.name ?? "";
  const initialEmail = initialData.email;
  const initialParts = initialName.trim().split(/\s+/).filter(Boolean);
  const initialFirst = initialParts[0] ?? "";
  const initialLast = initialParts.slice(1).join(" ");

  const router = useRouter();
  const utils = api.useUtils();

  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [email, setEmail] = useState(initialEmail);
  const [telegramUsername, setTelegramUsername] = useState(
    initialData.telegramUsername ?? "",
  );
  const [school, setSchool] = useState(initialData.school ?? "");
  const [goal, setGoal] = useState(
    initialData.examPointsGoal ? String(initialData.examPointsGoal) : "32",
  );
  const [notifs, setNotifs] = useState({
    weekly: initialData.notificationsWeekly ?? true,
    marketing: initialData.notificationsMarketing ?? false,
  });

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: async () => {
      setError(null);
      setSaved(true);
      // Refresh the cached identity (updates the header avatar instantly) and
      // re-render server components reading getProfileHeader (the hero).
      await utils.user.getProfileHeader.invalidate();
      router.refresh();
    },
    onError: (e) => {
      setSaved(false);
      setError(e.message);
    },
  });

  const handleSave = () => {
    setSaved(false);
    setError(null);
    const name = `${firstName} ${lastName}`.trim();
    if (!name) {
      setError("Укажите имя.");
      return;
    }
    updateProfile.mutate({
      name,
      email: email.trim(),
      telegramUsername: telegramUsername.trim() || null,
      school: school.trim() || null,
      examPointsGoal: goal ? Number(goal) : null,
      notificationsWeekly: notifs.weekly,
      notificationsMarketing: notifs.marketing,
    });
  };

  const handleReset = () => {
    setFirstName(initialFirst);
    setLastName(initialLast);
    setEmail(initialEmail);
    setTelegramUsername(initialData.telegramUsername ?? "");
    setSchool(initialData.school ?? "");
    setGoal(
      initialData.examPointsGoal ? String(initialData.examPointsGoal) : "32",
    );
    setNotifs({
      weekly: initialData.notificationsWeekly ?? true,
      marketing: initialData.notificationsMarketing ?? false,
    });
    setError(null);
    setSaved(false);
  };

  return (
    <section id="settings" className="mb-[72px] scroll-mt-8">
      <div className="mb-5">
        <SectionEyebrow>05 — настройки</SectionEyebrow>
        <h2 className="font-display m-0 mt-2 text-[28px] leading-none font-normal tracking-[-0.025em] sm:text-[38px]">
          Аккаунт
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Personal data */}
        <div className="border-line bg-surface rounded-lg border p-6 sm:p-8">
          <div className="font-display mb-[22px] text-[22px] tracking-[-0.02em]">
            Личные данные
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
            <Field label="имя">
              <input
                className={inputClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Field>
            <Field label="фамилия">
              <input
                className={inputClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Field>
            <Field label="e-mail">
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Telegram">
              <input
                className={inputClass}
                placeholder="@username"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
              />
            </Field>
            <Field label="школа">
              <input
                className={inputClass}
                placeholder="например, школа №1576"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </Field>
            <Field label="цель по баллам">
              <select
                className={inputClass}
                style={selectStyle}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                <option value="35">35 / 35 — максимум</option>
                <option value="32">32 / 35 — отлично</option>
                <option value="29">29 / 35 — хорошо</option>
                <option value="23">23 / 35 — удовл.</option>
              </select>
            </Field>
          </div>

          {error && <p className="text-err mt-4 text-[13.5px]">{error}</p>}
          {saved && !error && (
            <p
              className="mt-4 text-[13.5px]"
              style={{ color: "var(--color-ok)" }}
            >
              Сохранено. Профиль обновлён.
            </p>
          )}

          <div className="mt-6 flex gap-2.5">
            <button
              type="button"
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="rounded-pill bg-ink text-on-ink hover:bg-ink-hover inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium transition-colors disabled:opacity-60"
            >
              {updateProfile.isPending ? "Сохранение..." : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-pill border-line-2 text-ink hover:bg-surface-2 inline-flex h-11 items-center justify-center border bg-transparent px-[22px] text-[15px] font-medium transition-colors"
            >
              Отменить
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex flex-col gap-4">
          <div className="border-line bg-surface rounded-lg border p-7">
            <div className="font-display mb-1.5 text-[22px] tracking-[-0.02em]">
              Уведомления
            </div>
            <div className="text-ink-3 mb-2.5 text-[13.5px]">
              Куда отправлять: e-mail и Telegram-бот @oge_eng_exam_bot
            </div>
            <Toggle
              label="Еженедельный отчёт"
              sub="воскресенье вечером"
              on={notifs.weekly}
              onToggle={() => setNotifs((n) => ({ ...n, weekly: !n.weekly }))}
            />
            <Toggle
              label="Новости и обновления"
              sub="не чаще раза в месяц"
              on={notifs.marketing}
              onToggle={() =>
                setNotifs((n) => ({ ...n, marketing: !n.marketing }))
              }
            />
          </div>
        </div>
      </div>

      {/*<div className="border-line mt-8 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">*/}
      {/*  <div className="text-ink-3 max-w-[480px] text-[13.5px]">*/}
      {/*    Удаление учётной записи безвозвратно стирает прогресс, результаты*/}
      {/*    вариантов и достижения.*/}
      {/*  </div>*/}
      {/*  <span*/}
      {/*    className="cursor-not-allowed text-[14px] font-medium"*/}
      {/*    style={{ color: "var(--color-err)" }}*/}
      {/*    title="Скоро будет доступно"*/}
      {/*  >*/}
      {/*    Удалить учётную запись →*/}
      {/*  </span>*/}
      {/*</div>*/}
    </section>
  );
}
