import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "no_user" }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .maybeSingle();

  let orgId: string | null = null;

  if (existingProfile?.org_id) {
    orgId = existingProfile.org_id;
  } else {
    const { data: anyOrg } = await admin
      .from("organizations")
      .select("id, name")
      .limit(1)
      .maybeSingle();

    if (anyOrg) {
      orgId = anyOrg.id;
    } else {
      const { data: newOrg, error: orgErr } = await admin
        .from("organizations")
        .insert({
          name: "Mapa de Horario (Admin)",
          sector: "other",
          subscription_tier: "business",
          subscription_status: "active",
          plan_name: "Admin",
          base_price: 0,
          per_user_price: 0,
          billing_cycle: "monthly",
          is_active: true,
        })
        .select()
        .single();

      if (orgErr) {
        return NextResponse.json(
          { step: "create_org", error: orgErr },
          { status: 500 }
        );
      }
      orgId = newOrg.id;
    }
  }

  const profilePayload = {
    id: user.id,
    email: user.email!,
    full_name: "Tomas Napoles",
    role: "admin",
    org_id: orgId,
    is_super_admin: true,
    is_active: true,
    contract_type: "full_time",
    weekly_hours: 40,
    vacation_quota: 22,
  };

  const { data: profile, error: upsertErr } = await admin
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select("*, organizations(*)")
    .single();

  if (upsertErr) {
    return NextResponse.json(
      { step: "upsert_profile", error: upsertErr, payload: profilePayload },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "ok",
    userId: user.id,
    email: user.email,
    orgId,
    profile,
  });
}
