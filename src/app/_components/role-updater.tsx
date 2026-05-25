"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { updateRole } from "./actions";

export function RoleUpdater() {
  const { data: session, update } = useSession();

  useEffect(() => {
    const role = sessionStorage.getItem("selectedRole");

    if (session?.user && !session.user.role && role) {
      const updateAndRefreshSession = async () => {
        const result = await updateRole(role as "student" | "teacher");
        if (result.success) {
          sessionStorage.removeItem("selectedRole");
          // Trigger a session update to get the new role
          await update();
        }
      };

      void updateAndRefreshSession();
    }
  }, [session, update]);

  return null;
}
