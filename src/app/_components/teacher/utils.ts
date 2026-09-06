import { getInitials } from "@/app/_utils/user";

// Avatar tint palette, cycled by a stable hash of the student so the same
// person keeps the same colour across views. Uses the shared tone tokens.
const AVATAR_TONES = [
  "bg-tone-indigo text-tone-indigo-ink",
  "bg-tone-warm text-tone-warm-ink",
  "bg-tone-mint text-tone-mint-ink",
  "bg-tone-sand text-tone-sand-ink",
] as const;

export function avatarTone(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_TONES[Math.abs(h) % AVATAR_TONES.length]!;
}

export function displayName(
  name: string | null | undefined,
  email: string,
): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  const local = email.split("@")[0];
  return local && local.length > 0 ? local : "Ученик";
}

export { getInitials };

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});
const shortDateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatLongDate(date: Date): string {
  return dateFmt.format(date);
}

export function formatShortDate(date: Date): string {
  return shortDateFmt.format(date).replace(".", "");
}

export function formatTime(date: Date): string {
  return timeFmt.format(date);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Human "last active" label: сегодня / вчера / N дней назад / date. */
export function relativeDay(date: Date | null): string {
  if (!date) return "ещё не заходил";
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY_MS);
  if (diffDays <= 0) return "сегодня";
  if (diffDays === 1) return "вчера";
  if (diffDays < 7) return `${diffDays} дн назад`;
  if (diffDays < 14) return "неделю назад";
  return formatShortDate(date);
}

/** Build the shareable invite URL from a token (client-side, uses origin). */
export function inviteUrl(token: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/classes/join/${token}`;
}
