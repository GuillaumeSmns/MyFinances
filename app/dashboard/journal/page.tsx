import { redirect } from "next/navigation";

/** @deprecated Use /dashboard/budget */
export default function JournalRedirectPage() {
  redirect("/dashboard/budget");
}
