"use client";

import { signIn } from "next-auth/react";
import styles from "@/app/auth/auth.module.css";

type SimpleProvider = {
  id: string;
  name: string;
};

export function SocialProviders({ providers }: { providers: SimpleProvider[] }) {
  return (
    <div className={styles.providers}>
      {providers
        .filter((provider) => provider.id !== "credentials")
        .map((provider) => (
          <div key={provider.name} className={styles.providerButton}>
            <img
              src={`/oauth/${provider.id}.svg`}
              alt={provider.name}
              className={styles.providerImage}
              onClick={() => void signIn(provider.id)}
            />
          </div>
        ))}
    </div>
  );
}
