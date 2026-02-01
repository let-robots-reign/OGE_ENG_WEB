"use client";

import { type InputHTMLAttributes } from 'react';
import styles from './form.module.css';

type BaseRadioProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  modelValue: string | number;
  value: string | number;
  onUpdate: (value: string | number) => void;
  isChosenCorrect?: boolean | null;
};

export const BaseRadio = ({
  label,
  modelValue,
  value,
  onUpdate,
  name,
  disabled,
  isChosenCorrect,
}: BaseRadioProps) => {
  const isChecked = modelValue === value;

  const getLabelClass = () => {
    if (disabled && isChosenCorrect !== null) {
      if (isChosenCorrect && isChecked) {
        return styles.valid;
      }
      if (!isChosenCorrect && isChecked) {
        return styles.invalid;
      }
    }
    return '';
  };

  return (
    <label className={`${styles.radioLabel} ${getLabelClass()}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        onChange={() => onUpdate(value)}
        disabled={disabled}
        className={styles.radioInput}
      />
      {label}
    </label>
  );
};
