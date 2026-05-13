"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

type AddItemFormProps = {
  onAddItem: (label: string, amount: number) => void;
  buttonLabel?: string;
};

export function AddItemForm({ onAddItem, buttonLabel = "Add Item" }: AddItemFormProps) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedLabel = label.trim();
    if (!normalizedLabel) return;

    onAddItem(normalizedLabel, Number(amount || 0));
    setLabel("");
    setAmount("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-2 sm:grid-cols-[1fr_160px_auto]">
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Item label"
        className="rounded-lg border border-white/15 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/15"
      />
      <div className="flex items-center gap-2 rounded-lg border border-white/12 bg-slate-900/90 px-3 py-2 transition focus-within:border-cyan-300/50 focus-within:ring-2 focus-within:ring-cyan-300/15">
        <span className="text-xs font-medium tracking-wide text-slate-400">AED</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
          className="no-spinner w-full bg-transparent text-sm font-medium text-slate-100 outline-none placeholder:text-slate-500"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-violet-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
      >
        <Plus className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
        {buttonLabel}
      </button>
    </form>
  );
}
