"use client";

import clsx from "clsx";

type BaseSelectProps = {
  modelValue?: string | null;
  onUpdate: (value: string) => void;
  options: string[];
  className?: string;
  disabled?: boolean;
  placeholder?: string;
};

export function BaseSelect({
  modelValue,
  onUpdate,
  options,
  className = "",
  disabled = false,
  placeholder = "",
}: BaseSelectProps) {
  return (
    <select
      className={clsx(
        "border-line-2 bg-surface text-ink block w-full rounded-[3px] border-2 p-2 text-base outline-none transition-colors focus:border-ok active:border-ok",
        className,
      )}
      value={modelValue ?? ""}
      onChange={(e) => onUpdate(e.target.value)}
      disabled={disabled}
    >
      <option value={undefined} disabled>
        {placeholder}
      </option>
      {options.map((opt, index) => (
        <option key={opt + index} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
