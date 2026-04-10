import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { UserRole } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Use service role to bypass RLS (profiles table has a recursive policy).
  // Safe: we only select the authenticated user's own profile.
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile } = await admin
    .from("profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (!profile.org_id) redirect("/onboarding");

  // Count unread notifications
  const { count } = await admin
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  const org = profile.organizations as { name: string } | null;

  return (
    <DashboardShell
      role={profile.role as UserRole}
      orgName={org?.name || ""}
      userName={profile.full_name}
      unreadCount={count || 0}
    >
      {children}
    </DashboardShell>
  );
}
