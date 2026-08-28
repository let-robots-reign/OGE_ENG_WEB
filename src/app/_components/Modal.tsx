"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export type ModalProps = {
  title?: string;
  size?: "small" | "medium" | "large" | number;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({
  title,
  size = "small",
  onClose,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const widthStyle = typeof size === "number" ? { maxWidth: size } : undefined;
  const sizeClasses = {
    small: "max-w-[440px]",
    medium: "max-w-[520px]",
    large: "max-w-[720px]",
  };
  const sizeClass = typeof size === "string" ? sizeClasses[size] : "";

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] bg-[rgba(10,23,51,0.55)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed inset-0 z-[100] grid place-items-center p-4">
        <div
          className={clsx(
            "modal bg-surface pointer-events-auto max-h-[90vh] w-full overflow-hidden overflow-y-auto rounded-lg shadow-lg",
            sizeClass,
            className,
          )}
          style={widthStyle}
        >
          {title ? (
            <div className="flex flex-col gap-4 p-6 md:p-8">
              <h3 className="text-ink text-xl font-bold tracking-tight md:text-2xl">
                {title}
              </h3>
              <div className="text-ink-2 modal__content text-[16px] md:text-[18px]">
                {children}
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
