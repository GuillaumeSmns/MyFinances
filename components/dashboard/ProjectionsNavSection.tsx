"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { isProjectionsNavActive, PROJECTIONS_NAV } from "@/components/dashboard/dashboard-nav";

type ProjectionsNavSectionProps = {
  pathname: string;
  variant: "sidebar" | "mobile";
};

const itemBase =
  "group flex w-full items-center gap-3 rounded-lg border px-3 transition mf-light:hover:border-cyan-400/35 mf-light:hover:bg-cyan-500/5 mf-light:hover:text-cyan-800";

const parentActive =
  "border-cyan-400/40 bg-cyan-500/15 text-cyan-300";

const parentInactive =
  "border-transparent text-slate-300 hover:border-cyan-300/30 hover:bg-cyan-500/10 hover:text-cyan-200 mf-light:text-slate-600";

const childActiveLink =
  "border-[#f4be7e]/35 bg-[#f4be7e]/10 text-[#f4be7e] mf-light:border-[#d4a46a]/40 mf-light:bg-[#f4be7e]/15 mf-light:text-[#8f6b3f]";

const childInactiveLink =
  "border-transparent text-slate-400 hover:border-[#f4be7e]/25 hover:bg-[#f4be7e]/[0.07] hover:text-[#f4be7e] mf-light:text-slate-600 mf-light:hover:text-[#8f6b3f]";

export function ProjectionsNavSection({ pathname, variant }: ProjectionsNavSectionProps) {
  const projectionsActive = isProjectionsNavActive(pathname);
  const [open, setOpen] = useState(false);
  const expanded = projectionsActive || open;

  const { Icon, label, children } = PROJECTIONS_NAV;
  const isSidebar = variant === "sidebar";

  return (
    <div className={isSidebar ? "space-y-1" : "flex shrink-0 flex-col gap-1"}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={expanded}
        aria-controls="projections-nav-submenu"
        className={`${itemBase} ${isSidebar ? "py-2.5 text-sm" : "py-2 text-xs font-medium"} ${
          projectionsActive ? parentActive : parentInactive
        }`}
      >
        <Icon
          className={`${isSidebar ? "h-[18px] w-[18px]" : "h-4 w-4"} shrink-0 transition ${
            projectionsActive
              ? "text-cyan-400"
              : "text-faint group-hover:text-cyan-200/90 mf-light:group-hover:text-cyan-700"
          }`}
          strokeWidth={1.5}
          aria-hidden
        />
        <span className={`min-w-0 flex-1 text-left ${!isSidebar ? "whitespace-nowrap" : ""}`}>{label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          } ${projectionsActive ? "text-cyan-200/80 mf-light:text-cyan-700" : "text-faint"}`}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      <div
        id="projections-nav-submenu"
        className={`grid transition-all duration-300 ease-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <ul
            className={`${
              isSidebar
                ? "ml-2 space-y-1 border-l border-white/10 py-1 pl-3 mf-light:border-slate-200"
                : "min-w-[220px] space-y-1 rounded-lg border border-white/10 bg-slate-900/95 p-1.5 shadow-lg mf-light:border-slate-200 mf-light:bg-white"
            }`}
            role="list"
          >
            {children.map((child) => {
              const childActive = pathname === child.href;
              const ChildIcon = child.Icon;
              return (
                <li key={child.href} role="none">
                  <Link
                    href={child.href}
                    onClick={() => setOpen(false)}
                    className={`${itemBase} ${isSidebar ? "py-2 text-sm" : "py-2 text-xs"} ${
                      childActive ? childActiveLink : childInactiveLink
                    }`}
                  >
                    <ChildIcon
                      className={`${isSidebar ? "h-4 w-4" : "h-3.5 w-3.5"} shrink-0`}
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <span className={isSidebar ? "leading-snug" : "whitespace-nowrap"}>
                      {child.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
