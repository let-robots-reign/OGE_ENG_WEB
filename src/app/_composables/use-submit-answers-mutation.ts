"use client";

import { api } from "@/trpc/react";

export function useSubmitAnswersMutation() {
  const utils = api.useUtils();

  return api.training.submitAnswers.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.user.getStreak.invalidate(),
        utils.user.getActivity.invalidate(),
      ]);
    },
  });
}
