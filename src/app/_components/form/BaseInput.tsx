"use client";

import { type InputHTMLAttributes } from "react";
import clsx from "clsx";

type BaseInputProps = InputHTMLAttributes<HTMLInputElement> & {
  modelValue: string | number;
  onUpdate: (value: string) => void;
  label?: string;
};

export const BaseInput = ({
  modelValue,
  onUpdate,
  label,
  ...props
}: BaseInputProps) => {
  const id = `base-input-${Math.random()}`;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium">
          {label}
        </label>
      )}
      <input
        {...props}
        id={id}
        value={modelValue}
        onChange={(e) => onUpdate(e.target.value)}
        className={clsx(
          "border-line-2 bg-surface text-ink block w-full rounded border px-3 py-1.5 text-base leading-normal transition-colors focus:border-accent focus:outline-none",
          props.className,
        )}
      />
    </div>
  );
};
