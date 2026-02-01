"use client";

import { type InputHTMLAttributes } from "react";
import styles from "./form.module.css";

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
    <div className={styles.formControl}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        {...props}
        id={id}
        value={modelValue}
        onChange={(e) => onUpdate(e.target.value)}
        className={`${styles.formInput} ${props.className ?? ""}`}
      />
    </div>
  );
};
