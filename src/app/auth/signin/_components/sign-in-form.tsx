"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OAuthButtons } from "@/app/auth/_components/oauth-buttons";
import posthog from "posthog-js";

type SimpleProvider = {
  id: string;
  name: string;
};

const inputClass =
  "w-full h-[52px] px-[18px] border border-line-2 rounded-md bg-surface text-[15px] text-ink placeholder:text-ink-4 outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(10,23,51,0.06)] transition-all";

export function SignInForm({ providers }: { providers: SimpleProvider[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Неверная почта или пароль");
    } else {
      posthog.identify(email, { email });
      posthog.capture("user_signed_in", { method: "credentials" });
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div>
      {/* Eyebrow */}
      <div className="text-ink-3 mb-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
        <span className="bg-accent h-1.5 w-1.5 rounded-full" />
        вход
      </div>

      <h1 className="font-display text-ink mb-3 text-[40px] leading-none tracking-[-0.03em] sm:text-[56px]">
        С возвращением.
      </h1>
      <p className="text-ink-3 mb-8 text-[15px]">
        Войдите, чтобы продолжить тренировки.
      </p>

      <OAuthButtons providers={providers} layout="stacked" />

      <div className="text-ink-3 my-6 flex items-center gap-3 text-[12px]">
        <div className="bg-line h-px flex-1" />
        <span>или через почту</span>
        <div className="bg-line h-px flex-1" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <label className="text-ink-3 mb-2 block text-[13px] font-medium">
            Электронная почта
          </label>
          <input
            type="email"
            name="email"
            placeholder="masha@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <label className="text-ink-3 text-[13px] font-medium">Пароль</label>
            {/*<a href="#" className="text-accent text-[13px] hover:underline">*/}
            {/*  Забыли?*/}
            {/*</a>*/}
          </div>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p className="text-err text-[13.5px]">{error}</p>}

        <button
          type="submit"
          className="bg-ink text-on-ink rounded-pill mt-2 h-[52px] w-full text-[16px] font-medium transition-opacity hover:opacity-90"
        >
          Войти →
        </button>
      </form>

      <p className="text-ink-3 mt-7 text-[14px]">
        Нет аккаунта?{" "}
        <Link
          href="/auth/signup"
          className="text-ink border-ink-2 hover:border-ink border-b font-medium transition-colors"
        >
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
