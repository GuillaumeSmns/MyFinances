import { AssetsPageContent } from "@/components/dashboard/assets/AssetsPageContent";
import { createClient } from "@/utils/supabase/server";

export default async function AssetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AssetsPageContent userId={user?.id ?? null} />;
}
