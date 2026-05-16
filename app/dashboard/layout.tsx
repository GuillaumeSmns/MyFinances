import { redirect } from "next/navigation";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";
import { DashboardProviders } from "@/components/dashboard/DashboardProviders";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 mf-light:bg-slate-100 mf-light:text-slate-900">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <DashboardSidebar />
        <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
          <DashboardMobileNav />
          <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
            <DashboardProviders>{children}</DashboardProviders>
          </main>
        </div>
      </div>
    </div>
  );
}
