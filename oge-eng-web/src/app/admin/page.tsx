"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import styles from "@/app/admin/Admin.module.css";
import Link from "next/link";
import { z } from "zod";

const tabsOptions = z.enum(["training", "diagnostics"]);
type Tab = z.infer<typeof tabsOptions>;

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { data: session, status } = useSession();

  const parsedTab = tabsOptions.safeParse(tabParam);
  const [activeTab, setActiveTab] = useState<Tab>(
    parsedTab.success ? parsedTab.data : "training",
  );

  const hasAccess =
    status === "authenticated" && session?.user?.role === "admin";

  const { data: trainingData, isLoading: isLoadingTraining } =
    api.admin.getTrainingResults.useQuery(undefined, {
      enabled: activeTab === "training" && hasAccess,
    });

  const { data: diagnosticsData, isLoading: isLoadingDiagnostics } =
    api.admin.getDiagnosticsResults.useQuery(undefined, {
      enabled: activeTab === "diagnostics" && hasAccess,
    });

  if (status === "loading") {
    return <div className="text-white">Загрузка...</div>;
  }

  if (!hasAccess) {
    notFound();
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  const isLoading = isLoadingTraining || isLoadingDiagnostics;

  return (
    <div className={styles.adminContainer}>
      <h1 className="mb-3 text-2xl">История действий пользователей</h1>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "training" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("training")}
        >
          Тренировки
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "diagnostics" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("diagnostics")}
        >
          Диагностика
        </button>
      </div>

      {isLoading && <div>Загрузка данных...</div>}

      <div className={styles.tableContainer}>
        {activeTab === "training" && trainingData && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Имя пользователя</th>
                <th>Почта</th>
                <th>Тренировка</th>
                <th>Тема</th>
                <th>Дата</th>
                <th>Результат</th>
              </tr>
            </thead>
            <tbody>
              {trainingData.map((result) => (
                <tr key={result.id}>
                  <td>{result.user.name}</td>
                  <td>{result.user.email}</td>
                  <td>{result.topic?.category}</td>
                  <td>{result.topic?.title}</td>
                  <td>{new Date(result.createdAt).toLocaleString()}</td>
                  <td>{result.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "diagnostics" && diagnosticsData && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Имя пользователя</th>
                <th>Почта</th>
                <th>Дата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {diagnosticsData.map((result) => (
                <tr key={result.id}>
                  <td>{result.user.name}</td>
                  <td>{result.user.email}</td>
                  <td>{new Date(result.createdAt).toLocaleString()}</td>
                  <td>
                    <Link
                      href={`/admin/diagnostics/${result.id}`}
                      className={styles.viewButton}
                    >
                      Просмотреть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
