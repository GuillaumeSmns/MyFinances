"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { MfTheme } from "@/lib/theme-storage";

const options: { value: MfTheme; label: string; Icon: typeof Sun }[] = [
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "light", label: "Light", Icon: Sun },
];

export function ThemeToggleControl() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Monitor className="h-4 w-4 shrink-0 text-faint" strokeWidth={1.5} aria-hidden />
        <span>Interface theme</span>
      </div>
      <div
        className="inline-flex rounded-xl border border-border bg-muted p-1"
        role="group"
        aria-label="Theme"
      >
        {options.map(({ value, label, Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
