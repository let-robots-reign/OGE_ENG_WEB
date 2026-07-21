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
      <div
        className="fixed inset-0 z-[100] pointer-events-none grid place-items-center p-4"
      >
        <div
          className={clsx(
            "modal bg-surface max-h-[90vh] w-full overflow-hidden overflow-y-auto rounded-lg shadow-lg pointer-events-auto",
            sizeClass,
            className,
          )}
          style={widthStyle}
        >
          {title ? (
            <div className="p-6 md:p-8 flex flex-col gap-4">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-ink">
                {title}
              </h3>
              <div className="text-[16px] md:text-[18px] text-ink-2 modal__content">
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
