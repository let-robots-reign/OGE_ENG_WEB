import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import {
  JoinClassroom,
  JoinInvalid,
} from "@/app/_components/teacher/join-classroom";

function JoinShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth();

  // Send guests to sign in, returning them to this exact invite afterwards.
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/classes/join/${token}`)}`);
  }

  const info = await api.teacher.getClassroomByToken({ token });

  return (
    <JoinShell>
      {info === null ? (
        <JoinInvalid />
      ) : (
        <JoinClassroom token={token} info={info} />
      )}
    </JoinShell>
  );
}
