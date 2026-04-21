import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const startedAt = new Date().toISOString();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    // 1. Verify the caller is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify the caller is a super admin (use admin client to bypass RLS —
    //    prevents a user from self-promoting via a permissive profiles UPDATE policy)
    const admin = createAdminClient();
    const { data: callerProfile } = await admin
      .from("profiles")
      .select("is_super_admin, full_name, email")
      .eq("id", user.id)
      .single();

    if (!callerProfile?.is_super_admin) {
      console.warn(
        "[IMPERSONATE][DENIED] non-super-admin attempt",
        JSON.stringify({ callerId: user.id, ip, userAgent, startedAt })
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Validate request body
    let body: { userId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const targetUserId = body.userId;
    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 4. Guard: cannot impersonate yourself
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: "Cannot impersonate yourself" },
        { status: 400 }
      );
    }

    // 5. Lookup target user via admin client (bypass RLS)
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, email, is_super_admin, org_id, full_name")
      .eq("id", targetUserId)
      .single();

    if (!targetProfile?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 6. Guard: cannot impersonate other super admins (prevents privilege loops)
    if (targetProfile.is_super_admin) {
      console.warn(
        "[IMPERSONATE][DENIED] target is super_admin",
        JSON.stringify({
          callerId: user.id,
          targetId: targetUserId,
          ip,
          userAgent,
          startedAt,
        })
      );
      return NextResponse.json(
        { error: "Cannot impersonate another super admin" },
        { status: 403 }
      );
    }

    // 7. Generate a magic link that auto-signs in as the target user
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: targetProfile.email,
        options: {
          redirectTo: `${req.nextUrl.origin}/dashboard`,
        },
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      return NextResponse.json(
        { error: linkError?.message || "Failed to generate link" },
        { status: 500 }
      );
    }

    // 8. Audit log (structured — scrape via log aggregator)
    console.warn(
      "[IMPERSONATE][GRANTED]",
      JSON.stringify({
        callerId: user.id,
        callerEmail: callerProfile.email,
        targetId: targetUserId,
        targetEmail: targetProfile.email,
        targetOrgId: targetProfile.org_id,
        ip,
        userAgent,
        startedAt,
      })
    );

    // Best-effort persistent audit — no-op if table does not exist
    try {
      await admin.from("impersonation_logs").insert({
        caller_id: user.id,
        target_id: targetUserId,
        ip,
        user_agent: userAgent,
      });
    } catch (_auditErr) {
      // table may not exist yet — do not block impersonation
    }

    const verifyUrl = `${req.nextUrl.origin}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=magiclink&next=/dashboard`;

    return NextResponse.json({ url: verifyUrl });
  } catch (err) {
    console.error("[IMPERSONATE][ERROR]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
