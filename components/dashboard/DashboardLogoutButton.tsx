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
      ? "group flex w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-sm text-slate-300 transition duration-200 hover:border-cyan-300/30 hover:bg-cyan-500/10 hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(34,211,238,0.08)] mf-light:text-slate-600 mf-light:hover:border-cyan-400/35 mf-light:hover:bg-cyan-500/5 mf-light:hover:text-cyan-800"
      : "group flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition duration-200 hover:border-cyan-300/35 hover:bg-cyan-500/10 hover:text-cyan-100 hover:shadow-[0_0_16px_rgba(34,211,238,0.08)] mf-light:border-slate-200 mf-light:bg-white mf-light:text-slate-700 mf-light:hover:border-cyan-400/40 mf-light:hover:bg-cyan-500/5 mf-light:hover:text-cyan-800";

  return (
    <button
      type="button"
      disabled={busy}
      aria-busy={busy}
      className={`${base} disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-transparent disabled:hover:bg-transparent disabled:hover:text-slate-300 disabled:hover:shadow-none`}
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
        className={`shrink-0 transition duration-200 ${
          variant === "sidebar"
            ? "h-[18px] w-[18px] text-faint group-hover:text-cyan-200/90 mf-light:group-hover:text-cyan-700"
            : "h-4 w-4 text-slate-400 group-hover:text-cyan-200/90 mf-light:group-hover:text-cyan-700"
        }`}
        strokeWidth={1.5}
        aria-hidden
      />
      Logout
    </button>
  );
}
