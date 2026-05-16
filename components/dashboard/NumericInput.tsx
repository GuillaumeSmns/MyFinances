"use client";

import { useEffect, useRef, useState } from "react";
import {
  numberToInputString,
  parseNumericInput,
  sanitizeNumericDraft,
} from "@/lib/numeric-input";

type NumericInputBaseProps = {
  id?: string;
  className?: string;
  "aria-label"?: string;
  placeholder?: string;
  allowNegative?: boolean;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
};

/** String-controlled — for calculator forms; empty allowed while typing. */
export type StringNumericInputProps = NumericInputBaseProps & {
  value: string;
  onValueChange: (value: string) => void;
};

export function StringNumericInput({
  value,
  onValueChange,
  className,
  allowNegative = false,
  id,
  "aria-label": ariaLabel,
  placeholder,
  onFocus,
  onBlur,
}: StringNumericInputProps) {
  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      aria-label={ariaLabel}
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={(e) => onValueChange(sanitizeNumericDraft(e.target.value, allowNegative))}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

/** Number-controlled — commits on blur so empty draft does not force 0 while typing. */
export type BlurNumericInputProps = NumericInputBaseProps & {
  value: number;
  onValueChange: (value: number) => void;
};

export function BlurNumericInput({
  value,
  onValueChange,
  className,
  allowNegative = false,
  id,
  "aria-label": ariaLabel,
  placeholder,
  onFocus,
  onBlur,
}: BlurNumericInputProps) {
  const [draft, setDraft] = useState(() => numberToInputString(value));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(numberToInputString(value));
    }
  }, [value]);

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      aria-label={ariaLabel}
      placeholder={placeholder}
      className={className}
      value={draft}
      onFocus={(e) => {
        focusedRef.current = true;
        onFocus?.(e);
      }}
      onBlur={(e) => {
        focusedRef.current = false;
        const parsed = parseNumericInput(draft, 0);
        onValueChange(parsed);
        setDraft(numberToInputString(parsed));
        onBlur?.(e);
      }}
      onChange={(e) => setDraft(sanitizeNumericDraft(e.target.value, allowNegative))}
    />
  );
}
