import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Spectral } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Header } from "@/app/_components/header/header";
import { Footer } from "@/app/_components/footer";
import { AuthProvider } from "./_components/auth-provider";

export const metadata: Metadata = {
  title: "ОГЭ Английский",
  description: "Лучшее приложение для подготовки к ОГЭ по английскому языку",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  verification: {
    google: "vU3ku1o6ZUuyrHVW7aaSrPMjfit3xUR3cjTtJmj1YNQ",
    yandex: "c0b21efd1c574856",
  },
};

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${geist.variable} ${spectral.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the saved theme before first paint to avoid a flash.
            Default is light, so we only opt in to dark when explicitly stored. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("theme")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <TRPCReactProvider>
          <AuthProvider>
            <div className="mx-auto w-full max-w-350">
              <Header />
              <main>{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
