import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/team
 *
 * Returns team-member rows scoped to the caller's permission level:
 *
 *  - admin / manager: full cross-org view. All memberships across every
 *    organisation the caller manages, with every field. Used by the Equipa
 *    page to surface multi-pharmacy group operators.
 *
 *  - employee: limited same-org view. Only fellow members of the caller's
 *    ACTIVE organisation, and only the public-safe fields (name, role,
 *    credential). Contract type, weekly hours, email and activation state
 *    are omitted.
 *
 * Contrast with the schedule/availability/time-off pages, which are scoped
 * to the active org via RLS — there's no cross-org mode for those.
 *
 * Response shape:
 *   { memberships: Row[], orgs: {id,name}[], viewMode: "full" | "limited" }
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Find every active membership for the caller so we know (a) which orgs
  // they manage and (b) their active-org membership for the employee flow.
  const { data: callerMemberships, error: mErr } = await supabase
    .from("memberships")
    .select("org_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 });
  }

  const managedOrgIds = (callerMemberships || [])
    .filter((m) => m.role === "admin" || m.role === "manager")
    .map((m) => m.org_id);

  const admin = createAdminClient();

  // -------- admin / manager: full cross-org view --------
  if (managedOrgIds.length > 0) {
    const [{ data: rows, error: rowsErr }, { data: orgs, error: orgsErr }] =
      await Promise.all([
        admin
          .from("memberships")
          .select(
            "*, profile:profiles!memberships_user_id_fkey(email), org:organizations!memberships_org_id_fkey(id,name)"
          )
          .in("org_id", managedOrgIds)
          .order("full_name"),
        admin
          .from("organizations")
          .select("id,name")
          .in("id", managedOrgIds)
          .order("name"),
      ]);

    if (rowsErr) return NextResponse.json({ error: rowsErr.message }, { status: 500 });
    if (orgsErr) return NextResponse.json({ error: orgsErr.message }, { status: 500 });

    return NextResponse.json({
      memberships: rows || [],
      orgs: orgs || [],
      viewMode: "full",
    });
  }

  // -------- employee: limited same-org view --------
  // Use the caller's active org (fall back to any org they belong to).
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_org_id, org_id")
    .eq("id", user.id)
    .single();

  const activeOrgId =
    profile?.active_org_id ??
    profile?.org_id ??
    callerMemberships?.[0]?.org_id ??
    null;

  if (!activeOrgId) {
    return NextResponse.json({ memberships: [], orgs: [], viewMode: "limited" });
  }

  const { data: rows, error: rowsErr } = await admin
    .from("memberships")
    .select("id, user_id, org_id, full_name, role, credential")
    .eq("org_id", activeOrgId)
    .eq("is_active", true)
    .order("full_name");

  if (rowsErr) {
    return NextResponse.json({ error: rowsErr.message }, { status: 500 });
  }

  // Employee payload never carries sensitive fields — email, contract and
  // hours are intentionally absent. The UI only renders name/role/credential.
  return NextResponse.json({
    memberships: rows || [],
    orgs: [],
    viewMode: "limited",
  });
}
