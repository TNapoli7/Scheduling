import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Switch the authenticated user's active organisation.
 *
 * POST body: { org_id: string }
 *
 * Security: the caller must have a membership in the target org. We verify
 * that before writing profiles.active_org_id — so a malicious client can't
 * force themselves into an org they aren't a member of.
 */
export async function POST(request: Request) {
  try {
    const { org_id } = (await request.json()) as { org_id?: string };
    if (!org_id || typeof org_id !== "string") {
      return NextResponse.json({ error: "org_id required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Confirm membership — RLS on memberships lets the user read their own rows.
    const { data: membership } = await supabase
      .from("memberships")
      .select("id, org_id, is_active")
      .eq("user_id", user.id)
      .eq("org_id", org_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "Not a member of that organisation" }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ active_org_id: org_id })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to switch org: " + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, active_org_id: org_id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
