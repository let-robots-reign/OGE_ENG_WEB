import { Suspense } from "react";
import { notFound } from "next/navigation";
import { UoeTaskChainFormView } from "@/app/_components/admin/tasks/uoe-task-chain-form-view";

export default async function AdminEditUoeTaskChainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chainId = Number(id);
  if (!Number.isInteger(chainId) || chainId <= 0) notFound();

  return (
    <Suspense
      fallback={
        <div className="text-ink-3 p-8 text-center">Загрузка цепочки...</div>
      }
    >
      <UoeTaskChainFormView chainId={chainId} />
    </Suspense>
  );
}
