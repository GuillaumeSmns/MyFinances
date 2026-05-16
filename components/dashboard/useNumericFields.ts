"use client";

import { useMemo, useState } from "react";
import {
  numericFieldsFromDefaults,
  parseNumericFields,
} from "@/lib/numeric-input";

/** String field state + parsed numeric values for calculator forms. */
export function useNumericFields<T extends Record<string, number>>(defaults: T) {
  const [fields, setFields] = useState(() => numericFieldsFromDefaults(defaults));

  const values = useMemo(() => parseNumericFields(fields, defaults), [fields, defaults]);

  const setField = (key: keyof T, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const resetFields = (nextDefaults: T = defaults) => {
    setFields(numericFieldsFromDefaults(nextDefaults));
  };

  return { fields, setField, values, resetFields };
}
