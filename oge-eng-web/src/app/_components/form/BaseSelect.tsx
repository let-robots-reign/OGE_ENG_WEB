"use client";

import styles from "./BaseSelect.module.css";

type BaseSelectProps = {
  modelValue?: string | null;
  onUpdate: (value: string) => void;
  options: string[];
  className?: string;
};

export function BaseSelect({
  modelValue,
  onUpdate,
  options,
  className = "",
}: BaseSelectProps) {
  return (
    <select
      className={`${styles.select} ${className}`}
      value={modelValue ?? ""}
      onChange={(e) => onUpdate(e.target.value)}
    >
      <option value="" disabled key="">
        Выберите вопрос
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
