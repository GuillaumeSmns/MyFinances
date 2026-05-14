import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MOCK_AUTH_COOKIE, MOCK_AUTH_VALUE } from "@/lib/mock-auth-constants";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (cookieStore.get(MOCK_AUTH_COOKIE)?.value !== MOCK_AUTH_VALUE) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <DashboardSidebar />
        <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
          <DashboardMobileNav />
          <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
