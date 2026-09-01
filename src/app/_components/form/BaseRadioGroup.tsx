"use client";

import { BaseRadio } from "./BaseRadio";

type BaseRadioGroupProps = {
  options: (string | number)[];
  name: string;
  modelValue: string | number;
  onUpdate: (value: string | number) => void;
  vertical?: boolean;
  disabled?: boolean;
  isChosenCorrect?: boolean | null;
};

export const BaseRadioGroup = ({
  options,
  name,
  modelValue,
  onUpdate,
  vertical = false,
  disabled = false,
  isChosenCorrect = null,
}: BaseRadioGroupProps) => {
  return (
    <div>
      {options.map((option) => (
        <div key={option} className={vertical ? "block" : "mr-5 inline-block"}>
          <BaseRadio
            value={option}
            label={String(option)}
            name={name}
            modelValue={modelValue}
            onUpdate={onUpdate}
            disabled={disabled}
            isChosenCorrect={isChosenCorrect}
          />
        </div>
      ))}
    </div>
  );
};
