import { notFound } from "next/navigation";
import { auth } from "@/server/auth";

/**
 * Server-side role gate for the whole teacher cabinet. Mirrors the admin
 * layout: only `teacher`/`admin` may enter; everyone else gets a 404 (we don't
 * reveal the section exists). Per-class ownership is still enforced in every
 * tRPC procedure.
 */
export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "teacher" && role !== "admin") {
    notFound();
  }
  return <>{children}</>;
}
