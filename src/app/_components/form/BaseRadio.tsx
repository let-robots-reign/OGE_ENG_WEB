"use client";

import { type InputHTMLAttributes } from "react";
import clsx from "clsx";

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
        return "text-ok border-ok valid";
      }
      if (!isChosenCorrect && isChecked) {
        return "text-err border-err invalid";
      }
    }
    return "";
  };

  return (
    <label
      className={clsx(
        "inline-flex cursor-pointer items-center mr-4",
        getLabelClass(),
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        onChange={() => onUpdate(value)}
        disabled={disabled}
        className="mr-2"
      />
      {label}
    </label>
  );
};
