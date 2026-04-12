import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Verify the requester is a manager/admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: requester } = await supabase
      .from("profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (!requester || !["admin", "manager"].includes(requester.role)) {
      return NextResponse.json(
        { error: "Sem permissao" },
        { status: 403 }
      );
    }

    if (!requester.org_id) {
      return NextResponse.json(
        { error: "Sem organização associada" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, full_name, role, credential, contract_type, weekly_hours } =
      body;

    if (!email || !full_name) {
      return NextResponse.json(
        { error: "Email e nome sao obrigatorios" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Create auth user without sending email (email_confirm: true skips confirmation)
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name,
          role: role || "employee",
        },
      });

    if (authError) {
      // If user already exists, try to find them
      if (authError.message?.includes("already been registered")) {
        return NextResponse.json(
          { error: "Este email ja esta registado" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Erro ao criar utilizador" },
        { status: 500 }
      );
    }

    // Update the profile with full details + org_id
    // The trigger handle_new_user already created a basic profile
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        org_id: requester.org_id,
        full_name,
        role: role || "employee",
        credential: credential || null,
        contract_type: contract_type || "full_time",
        weekly_hours: weekly_hours || 40,
        is_active: true,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Log activity (server-side, fire-and-forget)
    admin.rpc("log_activity", {
      p_action: "employee_created",
      p_entity_type: "employee",
      p_entity_id: authData.user.id,
      p_details: { email, full_name },
    }).then(({ error: logErr }) => { if (logErr) console.warn("[activity-log]", logErr.message); });

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
