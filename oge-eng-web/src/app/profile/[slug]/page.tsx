import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

import styles from "./profile.module.css";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const { user } = session;

  return (
    <div className={styles.profile}>
      {user.name && <h2>Привет, {user.name}!</h2>}
      <h2>Скоро здесь будет страница вашего профиля и статистика.</h2>
      <h4>Stay tuned!</h4>
    </div>
  );
}
