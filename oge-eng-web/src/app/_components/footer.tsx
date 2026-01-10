import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <ul className={styles.footerLinks}>
          <li className={styles.footerLink}>
            <Link href="/">ОГЭ Английский (2026) &copy;</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
