"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/auth/auth.module.css";
import clsx from "clsx";
import { SocialProviders } from "@/app/auth/_components/social-providers";

type SimpleProvider = {
  id: string;
  name: string;
};

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
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className={styles.form}>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.inputGroup}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
        </div>
        <button
          type="submit"
          className={clsx(styles.button, styles.button_submit)}
        >
          Войти
        </button>
        <p className={clsx(styles.error, "mt-2", !error && "opacity-0")}>
          {error}
        </p>
      </form>
      <div className={styles.divider}>или</div>
      <SocialProviders providers={providers} />
      <p className={styles.signup}>
        Нет аккаунта? <Link href="/auth/signup">Зарегистрироваться</Link>
      </p>
    </div>
  );
}
