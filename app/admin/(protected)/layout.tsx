import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient();
  let email: string | null = null;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/admin/login");
    email = user.email ?? null;
  }

  return <AdminShell userEmail={email}>{children}</AdminShell>;
}
