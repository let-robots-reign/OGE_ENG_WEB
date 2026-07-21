import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import { RoleUpdater } from "./_components/role-updater";
// import { GreetingHero } from "./_components/home/greeting-hero";
import { TrainingSection } from "./_components/home/training-section";
import { VariantsSection } from "./_components/home/variants-section";
import { TheorySection } from "./_components/home/theory-section";
import { DiagnosticBanner } from "./_components/home/diagnostic-banner";

export default async function HomePage() {
  const session = await auth();

  const hasCompletedDiagnostics = session?.user
    ? await api.diagnostics.hasCompletedDiagnostics()
    : false;

  // const userName = session?.user
  //   ? (session.user.name ?? session.user.email?.split("@")[0] ?? null)
  //   : null;

  return (
    <div className="px-5 pt-8 pb-16 sm:px-8 lg:px-14">
      <RoleUpdater />
      {/*{userName && <GreetingHero userName={userName} />}*/}
      <TrainingSection />
      <VariantsSection />
      <TheorySection />
      <DiagnosticBanner
        completed={hasCompletedDiagnostics}
        loggedIn={!!session?.user}
      />
    </div>
  );
}
