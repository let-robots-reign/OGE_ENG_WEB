import styles from "@/app/auth/auth.module.css";

export function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>{title}</h1>
        {children}
      </div>
    </div>
  );
}
