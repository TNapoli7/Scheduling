import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Create (or invite) an employee into the caller's active organisation.
 *
 * Two flows handled:
 *   1. Brand-new user: create auth.user + profile + membership for this org.
 *   2. Existing user (already has an account in another org): just create
 *      a membership linking them to this org. No email sent; the admin
 *      tells them "you've been added to X".
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      email,
      full_name,
      role,
      credential,
      contract_type,
      weekly_hours,
      org_id: targetOrgId,
    } = body as {
      email: string;
      full_name: string;
      role?: string;
      credential?: string | null;
      contract_type?: string;
      weekly_hours?: number;
      /** Optional — defaults to caller's active org when absent. */
      org_id?: string;
    };

    // Resolve the org we're adding the employee to. If the client didn't
    // specify (single-org caller), fall back to active_org_id on the profile.
    let activeOrgId: string | null = targetOrgId ?? null;
    if (!activeOrgId) {
      const { data: requesterProfile } = await supabase
        .from("profiles")
        .select("active_org_id, org_id")
        .eq("id", user.id)
        .single();
      activeOrgId =
        requesterProfile?.active_org_id ?? requesterProfile?.org_id ?? null;
    }

    if (!activeOrgId) {
      return NextResponse.json(
        { error: "Sem organização associada" },
        { status: 400 }
      );
    }

    // Verify the caller is admin/manager of the TARGET org specifically —
    // so a manager of Org A can't add employees to Org B by passing its id.
    const { data: callerMembership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", activeOrgId)
      .eq("is_active", true)
      .maybeSingle();

    const callerRole = callerMembership?.role;
    if (!callerRole || !["admin", "manager"].includes(callerRole)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (!full_name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    let targetUserId: string | null = null;
    let existing: { id: string; email?: string } | undefined;

    if (email) {
      // ── Flow A: Employee WITH email ─────────────────────────────────
      // Look up or create an auth user. If the email already exists in
      // the auth directory, re-use their user_id and add a membership.
      // Look up by email directly instead of listing all users
      const { data: existingList } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
        filter: email.toLowerCase(),
      });
      existing = existingList?.users?.[0];

      if (existing) {
        targetUserId = existing.id;
      } else {
        const { data: authData, error: authError } =
          await admin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { full_name, role: role || "employee" },
          });
        if (authError) {
          return NextResponse.json({ error: authError.message }, { status: 500 });
        }
        if (!authData.user) {
          return NextResponse.json(
            { error: "Erro ao criar utilizador" },
            { status: 500 }
          );
        }
        targetUserId = authData.user.id;
      }
    } else {
      // ── Flow B: Employee WITHOUT email (offline-only) ───────────────
      // Create an auth user with a placeholder email so we get a valid
      // UUID to link profile + membership. The placeholder is not a real
      // inbox — the employee can't log in until the admin later adds a
      // real email and sends an invite.
      const placeholderEmail = `noinvite+${crypto.randomUUID().slice(0, 8)}@shiftera.app`;
      const { data: authData, error: authError } =
        await admin.auth.admin.createUser({
          email: placeholderEmail,
          email_confirm: true,
          user_metadata: { full_name, role: role || "employee", placeholder: true },
        });
      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }
      if (!authData.user) {
        return NextResponse.json(
          { error: "Erro ao criar utilizador" },
          { status: 500 }
        );
      }
      targetUserId = authData.user.id;
    }

    // 2. Ensure a profile row exists (the handle_new_user trigger usually
    //    makes one, but we guard against the case where it didn't).
    await admin
      .from("profiles")
      .upsert(
        { id: targetUserId, email: email || null },
        { onConflict: "id", ignoreDuplicates: true }
      );

    // If they had no active org, default to this one.
    await admin
      .from("profiles")
      .update({ active_org_id: activeOrgId })
      .eq("id", targetUserId)
      .is("active_org_id", null);

    // 3. Write the membership (upsert in case of re-add of a deactivated).
    const { data: membershipRow, error: membershipError } = await admin
      .from("memberships")
      .upsert(
        {
          user_id: targetUserId,
          org_id: activeOrgId,
          role: role || "employee",
          full_name,
          credential: credential || null,
          contract_type: contract_type || "full_time",
          weekly_hours: weekly_hours || 40,
          is_active: true,
        },
        { onConflict: "user_id,org_id" }
      )
      .select("id")
      .single();

    if (membershipError) {
      return NextResponse.json(
        { error: membershipError.message },
        { status: 500 }
      );
    }

    // 4. Legacy profile columns (role/full_name/etc.) kept populated this
    //    release as a safety net — helpful if anything still reads them.
    await admin
      .from("profiles")
      .update({
        org_id: activeOrgId,
        full_name,
        role: role || "employee",
        credential: credential || null,
        contract_type: contract_type || "full_time",
        weekly_hours: weekly_hours || 40,
        is_active: true,
      })
      .eq("id", targetUserId);

    // Log activity (fire-and-forget)
    admin
      .rpc("log_activity", {
        p_action: existing ? "employee_invited" : "employee_created",
        p_entity_type: "employee",
        p_entity_id: targetUserId,
        p_details: { email: email || null, full_name, org_id: activeOrgId },
      })
      .then(({ error: logErr }) => {
        if (logErr) console.warn("[activity-log]", logErr.message);
      });

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      membershipId: membershipRow?.id,
      existed: !!existing,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
