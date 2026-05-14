"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

type DashboardLogoutButtonProps = {
  /** Tighter styling for the horizontal mobile bar */
  variant?: "sidebar" | "mobile";
};

export function DashboardLogoutButton({ variant = "sidebar" }: DashboardLogoutButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const base =
    variant === "sidebar"
      ? "group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-sm text-slate-300 transition hover:border-rose-300/25 hover:bg-rose-500/10 hover:text-rose-100"
      : "flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-rose-300/35 hover:bg-rose-500/10 hover:text-rose-100";

  return (
    <button
      type="button"
      disabled={busy}
      aria-busy={busy}
      className={base}
      onClick={async () => {
        setBusy(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        setBusy(false);
        router.replace("/");
        router.refresh();
      }}
    >
      <LogOut
        className={`shrink-0 transition ${variant === "sidebar" ? "h-[18px] w-[18px] text-slate-500 group-hover:text-rose-200/90" : "h-4 w-4 text-slate-400"}`}
        strokeWidth={1.5}
        aria-hidden
      />
      Logout
    </button>
  );
}
