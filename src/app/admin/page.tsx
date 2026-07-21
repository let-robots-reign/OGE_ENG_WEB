import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { AdminView } from "@/app/_components/admin/admin-view";

export default async function AdminPage() {
  const session = await auth();

  // Same 404-for-non-admins behavior as before, but decided on the server —
  // no client loading flash, and the page contents never reach non-admins.
  if (session?.user?.role !== "admin") {
    notFound();
  }

  return (
    // Suspense boundary required because AdminView reads useSearchParams.
    <Suspense fallback={null}>
      <AdminView />
    </Suspense>
  );
}
