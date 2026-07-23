"use client";

import { useEffect, useRef, useState } from "react";

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface CustomSelectProps<T extends string | number> {
  options: SelectOption<T>[];
  value: T | "" | undefined;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
}

export function CustomSelect<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  className = "",
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-surface-2 border-line text-ink hover:bg-surface-2/80 flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2 text-[14px] transition-colors focus:outline-hidden focus:ring-2 focus:ring-accent/40"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`text-ink-3 h-4 w-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="bg-surface border-line shadow-md absolute top-full left-0 z-50 mt-1.5 max-h-60 w-full min-w-[180px] overflow-y-auto rounded-xl border py-1.5 transition-all">
          {options.length === 0 ? (
            <div className="text-ink-4 px-3.5 py-2 text-[13px]">
              Нет доступных вариантов
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-[14px] transition-colors ${
                    isSelected
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-ink hover:bg-surface-2"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <svg
                      className="text-accent h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
