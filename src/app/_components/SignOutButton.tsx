"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Modal } from "./Modal";
import posthog from "posthog-js";

export function SignOutButton() {
  const [showModal, setShowModal] = useState(false);

  const handleSignOut = () => {
    posthog.capture("user_signed_out");
    posthog.reset();
    void signOut({ redirectTo: "/" });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="cursor-pointer border-0 bg-transparent p-2 text-[20px] text-ink no-underline transition-colors hover:text-ok"
      >
        Выход
      </button>
      {showModal && (
        <Modal
          title="Вы уверены, что хотите выйти?"
          onClose={() => setShowModal(false)}
        >
          <div className="flex justify-center gap-4">
            <button
              onClick={handleSignOut}
              className="bg-ok cursor-pointer rounded-2xl px-6 py-2 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80"
            >
              Да
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="bg-surface-3 text-ink-2 cursor-pointer rounded-2xl px-6 py-2 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
            >
              Отменить
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
