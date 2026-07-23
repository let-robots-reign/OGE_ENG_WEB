import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { AdminLayoutWrapper } from "@/app/_components/admin/admin-layout-wrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    notFound();
  }

  return (
    <Suspense fallback={<div className="text-ink-3 p-8 text-center">Загрузка...</div>}>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </Suspense>
  );
}
