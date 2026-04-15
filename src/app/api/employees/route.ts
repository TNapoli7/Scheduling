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

    // Resolve the caller's active organisation + role via memberships.
    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("active_org_id, org_id")
      .eq("id", user.id)
      .single();

    const activeOrgId =
      requesterProfile?.active_org_id ?? requesterProfile?.org_id ?? null;

    if (!activeOrgId) {
      return NextResponse.json(
        { error: "Sem organização associada" },
        { status: 400 }
      );
    }

    const { data: callerMembership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", activeOrgId)
      .maybeSingle();

    const callerRole = callerMembership?.role;
    if (!callerRole || !["admin", "manager"].includes(callerRole)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const body = await request.json();
    const { email, full_name, role, credential, contract_type, weekly_hours } =
      body as {
        email: string;
        full_name: string;
        role?: string;
        credential?: string | null;
        contract_type?: string;
        weekly_hours?: number;
      };

    if (!email || !full_name) {
      return NextResponse.json(
        { error: "Email e nome são obrigatórios" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Look up or create the auth user. If the email already exists in
    //    the auth directory, we re-use their user_id and just add a
    //    membership to this org.
    let targetUserId: string | null = null;

    // Find existing auth user by email (admin listUsers is paginated, but
    // email is unique, so single lookup works with filter).
    const { data: existingList } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    const existing = existingList?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

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

    // 2. Ensure a profile row exists (the handle_new_user trigger usually
    //    makes one, but we guard against the case where it didn't).
    await admin
      .from("profiles")
      .upsert(
        { id: targetUserId, email },
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
        p_details: { email, full_name, org_id: activeOrgId },
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
