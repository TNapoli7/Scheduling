import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ChatWidget } from "@/components/chat/ChatWidget";
import type { UserRole } from "@/types/database";
import type { OrgSwitcherItem } from "@/components/layout/OrgSwitcher";

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
    .select("id, email, full_name, active_org_id, org_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Load every org the user is a member of (used by the switcher).
  const { data: membershipsData } = await supabase
    .from("memberships")
    .select("id, org_id, role, full_name, is_active, organizations(name)")
    .eq("user_id", user.id)
    .eq("is_active", true);

  type MembershipRow = {
    org_id: string;
    role: UserRole;
    full_name: string;
    organizations: { name: string } | { name: string }[] | null;
  };

  const memberships: OrgSwitcherItem[] = ((membershipsData || []) as MembershipRow[])
    .map((m) => {
      const orgName = Array.isArray(m.organizations)
        ? m.organizations[0]?.name
        : m.organizations?.name;
      return {
        org_id: m.org_id,
        org_name: orgName || "",
        role: m.role,
        full_name: m.full_name,
      };
    });

  // User with no org yet → send to onboarding
  if (memberships.length === 0 && !profile.org_id) {
    redirect("/onboarding");
  }

  // Resolve the active org — falls back to first membership if unset
  const activeOrgId =
    profile.active_org_id ??
    profile.org_id ??
    memberships[0]?.org_id ??
    null;

  // Find the membership that matches the active org (for role/name display)
  const activeMembership =
    memberships.find((m) => m.org_id === activeOrgId) ?? memberships[0];

  const activeRole = (activeMembership?.role ?? profile.role) as UserRole;
  const activeOrgName = activeMembership?.org_name ?? "";
  // Prefer the per-org display name from the membership — lets the same user
  // be "Dra. Fernandes" in a clinic and "Tomás" in a café. Falls back to
  // profile level if no membership yet.
  const activeUserName =
    activeMembership?.full_name || profile.full_name || profile.email;

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

  return (
    <>
      <DashboardShell
        role={activeRole}
        orgName={activeOrgName}
        userName={activeUserName}
        unreadCount={count || 0}
        memberships={memberships}
        activeOrgId={activeOrgId}
      >
        {children}
      </DashboardShell>
      <ChatWidget />
    </>
  );
}
