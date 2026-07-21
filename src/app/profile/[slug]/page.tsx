import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { getInitials } from "@/app/_utils/user";
import { IdentityHero } from "@/app/_components/profile/identity-hero";
import { ActivitySection } from "@/app/_components/profile/activity-section";
import { SubjectProgress } from "@/app/_components/profile/subject-progress";
import { HistoryTable } from "@/app/_components/profile/history-table";
import { SettingsSection } from "@/app/_components/profile/settings-section";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const [profileData, subjects, recent] = await Promise.all([
    api.user.getProfileHeader(),
    api.user.getSubjectProgress(),
    api.user.getRecentActivity({ limit: 8 }),
  ]);

  const initials = getInitials(profileData.name, profileData.email);

  return (
    <div className="px-5 pt-8 pb-16 sm:px-8 lg:px-14">
      <div className="mb-8">
        <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
          <span className="bg-accent h-1.5 w-1.5 rounded-full" />
          профиль ученика
        </div>
      </div>

      <IdentityHero
        name={profileData.name}
        email={profileData.email}
        initials={initials}
        emailVerified={profileData.emailVerified}
        role={profileData.role}
      />

      <ActivitySection />
      <SubjectProgress subjects={subjects} />
      <HistoryTable rows={recent} />
      <SettingsSection initialData={profileData} />
    </div>
  );
}
