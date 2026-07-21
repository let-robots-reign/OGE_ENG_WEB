import { authConfig } from "@/server/auth";
import { SignUpForm } from "./_components/sign-up-form";
import { type CommonProviderOptions } from "next-auth/providers";
import { AuthSplitLayout } from "../_components/auth-split-layout";
import { RightPanelSignUp } from "../_components/right-panel-signup";

export default function SignUpPage() {
  const providers = (authConfig.providers as CommonProviderOptions[]).map(
    (provider) => ({
      id: provider.id,
      name: provider.name,
    }),
  );

  return (
    <AuthSplitLayout rightPanel={<RightPanelSignUp />}>
      <SignUpForm providers={providers} />
    </AuthSplitLayout>
  );
}
