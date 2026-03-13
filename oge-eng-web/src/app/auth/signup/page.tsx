import { authConfig } from "@/server/auth";
import { SignUpForm } from "./_components/sign-up-form";
import { type CommonProviderOptions } from "next-auth/providers";
import { AuthLayout } from "../_components/auth-layout";

export default function SignUpPage() {
  const providers = (authConfig.providers as CommonProviderOptions[]).map(
    (provider) => ({
      id: provider.id,
      name: provider.name,
    }),
  );

  return (
    <AuthLayout title="Регистрация">
      <SignUpForm providers={providers} />
    </AuthLayout>
  );
}
