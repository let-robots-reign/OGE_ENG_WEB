"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "./actions";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { type z } from "zod";
import { SignupSchema } from "./schema";
import { OAuthButtons } from "@/app/auth/_components/oauth-buttons";
import posthog from "posthog-js";

type SimpleProvider = {
  id: string;
  name: string;
};

type FormFields = z.infer<typeof SignupSchema>;
type FormErrors = Partial<Record<keyof FormFields, string>>;

const inputClass =
  "w-full h-[52px] px-[18px] border border-line-2 rounded-md bg-surface text-[15px] text-ink placeholder:text-ink-4 outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(10,23,51,0.06)] transition-all";

export function SignUpForm({ providers }: { providers: SimpleProvider[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [agreed, setAgreed] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (errors.name) {
      const result = SignupSchema.shape.name.safeParse(value);
      if (result.success) {
        setErrors((prev) => {
          const n = { ...prev };
          delete n.name;
          return n;
        });
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      const result = SignupSchema.shape.email.safeParse(value);
      if (result.success) {
        setErrors((prev) => {
          const n = { ...prev };
          delete n.email;
          return n;
        });
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password) {
      const result = SignupSchema.shape.password.safeParse(value);
      if (result.success) {
        setErrors((prev) => {
          const n = { ...prev };
          delete n.password;
          return n;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationResult = SignupSchema.safeParse({
      name,
      email,
      password,
      role,
    });

    if (!validationResult.success) {
      const newErrors: FormErrors = {};
      for (const issue of validationResult.error.issues) {
        newErrors[issue.path[0] as keyof FormFields] = issue.message;
      }
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const result = await signup({ name, email, password, role });

    if (!result.success) {
      setServerError(result.error ?? "Произошла ошибка");
    } else {
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        posthog.identify(email, { name, email, role });
        posthog.capture("user_signed_up", { role, method: "credentials" });
        router.push("/");
        router.refresh();
      } else {
        setServerError(
          signInResult?.error ?? "Не удалось войти после регистрации.",
        );
      }
    }
  };

  return (
    <div>
      {/* Eyebrow */}
      <div className="text-ink-3 mb-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
        <span className="bg-accent h-1.5 w-1.5 rounded-full" />
        регистрация
      </div>

      <h1 className="font-display text-ink mb-3 text-[40px] leading-none tracking-[-0.03em] sm:text-[56px]">
        Создайте аккаунт
      </h1>
      <p className="text-ink-3 mb-7 text-[15px]">
        Все функции доступны абсолютно бесплатно.
      </p>

      <OAuthButtons providers={providers} layout="row" role={role} />

      <div className="text-ink-3 my-6 flex items-center gap-3 text-[12px]">
        <div className="bg-line h-px flex-1" />
        <span>или через почту</span>
        <div className="bg-line h-px flex-1" />
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-[14px]"
      >
        {serverError && <p className="text-err text-[13.5px]">{serverError}</p>}

        <div>
          <label className="text-ink-3 mb-2 block text-[13px] font-medium">
            Имя
          </label>
          <input
            type="text"
            name="name"
            placeholder="Маша"
            value={name}
            onChange={handleNameChange}
            className={inputClass}
          />
          {errors.name && (
            <p className="text-err mt-1.5 text-[13px]">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="text-ink-3 mb-2 block text-[13px] font-medium">
            Электронная почта
          </label>
          <input
            type="email"
            name="email"
            placeholder="masha@example.com"
            value={email}
            onChange={handleEmailChange}
            className={inputClass}
          />
          {errors.email && (
            <p className="text-err mt-1.5 text-[13px]">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="text-ink-3 mb-2 block text-[13px] font-medium">
            Пароль · минимум 8 символов
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            className={inputClass}
          />
          {errors.password && (
            <p className="text-err mt-1.5 text-[13px]">{errors.password}</p>
          )}
        </div>

        {/* Role toggle — styled as segmented buttons, no label */}
        <div className="flex gap-1.5">
          {(["student", "teacher"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`h-[46px] flex-1 rounded-md border text-[15px] font-medium transition-colors ${
                role === r
                  ? "bg-ink border-ink text-on-ink"
                  : "bg-surface text-ink-2 border-line-2 hover:bg-surface-2"
              }`}
            >
              {r === "student" ? "Я ученик" : "Я учитель"}
            </button>
          ))}
        </div>

        <label className="text-ink-3 mt-1.5 flex cursor-pointer items-start gap-2.5 text-[13px]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-[2px] shrink-0"
          />
          {/*<span>*/}
          {/*  Принимаю{" "}*/}
          {/*  <a href="#" className="text-ink-2 underline">*/}
          {/*    условия использования*/}
          {/*  </a>{" "}*/}
          {/*  и{" "}*/}
          {/*  <a href="#" className="text-ink-2 underline">*/}
          {/*    политику конфиденциальности*/}
          {/*  </a>*/}
          {/*</span>*/}
        </label>

        <button
          type="submit"
          disabled={!agreed}
          className="bg-ink text-on-ink rounded-pill mt-2 h-[52px] w-full text-[16px] font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Создать аккаунт →
        </button>
      </form>

      <p className="text-ink-3 mt-6 text-[14px]">
        Уже есть аккаунт?{" "}
        <Link
          href="/auth/signin"
          className="text-ink border-ink-2 hover:border-ink border-b font-medium transition-colors"
        >
          Войти
        </Link>
      </p>
    </div>
  );
}
