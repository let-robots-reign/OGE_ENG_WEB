import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";

import styles from "./page.module.css";
import { AuthProvider } from "./_components/auth-provider";

export const metadata: Metadata = {
  title: "ОГЭ Английский",
  description: "Лучшее приложение для подготовки к ОГЭ по английскому языку",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  verification: {
    google: "vU3ku1o6ZUuyrHVW7aaSrPMjfit3xUR3cjTtJmj1YNQ",
    yandex: "c0b21efd1c574856"
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-main",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <TRPCReactProvider>
          <AuthProvider>
            <Header />
            <main className={styles.main}>{children}</main>
            <Footer />
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
