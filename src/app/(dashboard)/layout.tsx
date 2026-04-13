import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ChatWidget } from "@/components/chat/ChatWidget";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (!profile.org_id) redirect("/onboarding");

  // Track last login (fire-and-forget, no await needed)
  supabase
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id)
    .then(() => {});

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  const org = profile.organizations as { name: string } | null;

  return (
    <>
      <DashboardShell
        role={profile.role as UserRole}
        orgName={org?.name || ""}
        userName={profile.full_name}
        unreadCount={count || 0}
      >
        {children}
      </DashboardShell>
      <ChatWidget />
    </>
  );
}
