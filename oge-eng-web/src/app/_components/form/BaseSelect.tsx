"use client";

import styles from "./BaseSelect.module.css";

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
      className={`${styles.select} ${className}`}
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
