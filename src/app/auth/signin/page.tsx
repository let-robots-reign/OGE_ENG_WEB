import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth, authConfig } from "@/server/auth";

import { SignInForm } from "./_components/sign-in-form";
import { AuthSplitLayout } from "../_components/auth-split-layout";
import { RightPanelSignIn } from "../_components/right-panel-signin";
import { type CommonProviderOptions } from "next-auth/providers";
import { safeCallbackUrl } from "@/app/_utils/callback-url";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(
    typeof params.callbackUrl === "string" ? params.callbackUrl : undefined,
  );

  if (session) {
    return redirect(callbackUrl);
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
