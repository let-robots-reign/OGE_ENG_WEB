import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth, authConfig } from "@/server/auth";

import { SignInForm } from "./_components/sign-in-form";
import styles from "@/app/auth/auth.module.css";
import { type CommonProviderOptions } from "next-auth/providers";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    return redirect("/");
  }

  const providers = (authConfig.providers as CommonProviderOptions[]).map(
    (provider) => ({
      id: provider.id,
      name: provider.name,
    }),
  );

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Войти</h1>
        <Suspense fallback={<div>Загрузка...</div>}>
          <SignInForm providers={providers} />
        </Suspense>
      </div>
    </div>
  );
}
