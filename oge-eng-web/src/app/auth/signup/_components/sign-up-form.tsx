"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "./actions";
import styles from "@/app/auth/auth.module.css";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { type z } from "zod";
import { SignupSchema } from "./schema";

type SimpleProvider = {
  id: string;
  name: string;
};

type FormFields = z.infer<typeof SignupSchema>;

export function SignUpForm({ providers }: { providers: SimpleProvider[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<FormFields>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (errors.name) {
      const result = SignupSchema.shape.name.safeParse(value);
      if (result.success) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.name;
          return newErrors;
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
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
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
          const newErrors = { ...prev };
          delete newErrors.password;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationResult = SignupSchema.safeParse({ name, email, password });

    if (!validationResult.success) {
      const newErrors: Partial<FormFields> = {};
      for (const issue of validationResult.error.issues) {
        newErrors[issue.path[0] as keyof FormFields] = issue.message;
      }
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear errors on successful client validation

    const result = await signup({ name, email, password });

    if (!result.success) {
      setServerError(result.error ?? "Произошла ошибка");
    } else {
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
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
    <div className={styles.form}>
      <form onSubmit={handleSubmit} noValidate>
        {serverError && <p className={styles.error}>{serverError}</p>}
        <div className={styles.inputGroup}>
          <input
            type="text"
            name="name"
            placeholder="Имя"
            value={name}
            onChange={handleNameChange}
            className={styles.input}
          />
          {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
        </div>
        <div className={styles.inputGroup}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            className={styles.input}
          />
          {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
        </div>
        <div className={styles.inputGroup}>
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={password}
            onChange={handlePasswordChange}
            className={styles.input}
          />
          {errors.password && (
            <p className={styles.fieldError}>{errors.password}</p>
          )}
        </div>
        <button type="submit" className={styles.button}>
          Зарегистрироваться
        </button>
      </form>
      <div className={styles.divider}>или</div>
      {providers
        .filter((provider) => provider.id !== "credentials")
        .map((provider) => (
          <div key={provider.name}>
            <button
              onClick={() => void signIn(provider.id)}
              className={styles.button}
            >
              Регистрация через {provider.name}
            </button>
          </div>
        ))}
      <p className={styles.signin}>
        Уже есть аккаунт? <Link href="/auth/signin">Войти</Link>
      </p>
    </div>
  );
}
