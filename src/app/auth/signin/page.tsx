import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth, authConfig } from "@/server/auth";

import { SignInForm } from "./_components/sign-in-form";
import { AuthSplitLayout } from "../_components/auth-split-layout";
import { RightPanelSignIn } from "../_components/right-panel-signin";
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
    <AuthSplitLayout rightPanel={<RightPanelSignIn />}>
      <Suspense fallback={<div>Загрузка...</div>}>
        <SignInForm providers={providers} />
      </Suspense>
    </AuthSplitLayout>
  );
}
