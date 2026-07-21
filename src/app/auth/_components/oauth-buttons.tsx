"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

type SimpleProvider = {
  id: string;
  name: string;
};

const PROVIDER_META: Record<
  string,
  { label: string; shortLabel: string; icon: string }
> = {
  yandex: {
    label: "Войти через Яндекс",
    shortLabel: "Яндекс",
    icon: "/oauth/yandex.svg",
  },
  vk: {
    label: "Войти через ВКонтакте",
    shortLabel: "ВКонтакте",
    icon: "/oauth/vk.svg",
  },
};

interface OAuthButtonsProps {
  providers: SimpleProvider[];
  layout: "stacked" | "row";
  role?: "student" | "teacher";
}

export function OAuthButtons({ providers, layout, role }: OAuthButtonsProps) {
  const oauthProviders = providers.filter((p) => p.id !== "credentials");

  const handleSignIn = (providerId: string) => {
    void signIn(providerId, {
      callbackUrl: "/",
      ...(role ? { role } : {}),
    });
  };

  if (layout === "stacked") {
    return (
      <div className="flex flex-col gap-2.5">
        {oauthProviders.map((p) => {
          const meta = PROVIDER_META[p.id];
          if (!meta) return null;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSignIn(p.id)}
              className="border-line-2 bg-surface text-ink hover:bg-surface-2 flex h-12 w-full items-center justify-center gap-3 rounded-md border text-[14.5px] font-medium transition-colors"
            >
              <Image
                src={meta.icon}
                alt={meta.shortLabel}
                width={20}
                height={20}
              />
              {meta.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {oauthProviders.map((p) => {
        const meta = PROVIDER_META[p.id];
        if (!meta) return null;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSignIn(p.id)}
            className="border-line-2 bg-surface text-ink hover:bg-surface-2 flex h-11 flex-1 items-center justify-center gap-2 rounded-md border text-[13.5px] font-medium transition-colors"
          >
            <Image
              src={meta.icon}
              alt={meta.shortLabel}
              width={18}
              height={18}
            />
            {meta.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
