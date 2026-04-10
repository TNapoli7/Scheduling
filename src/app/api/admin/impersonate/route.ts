import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify the caller is a super admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Get target user ID
    const body = await req.json();
    const targetUserId = body.userId;

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 3. Generate a magic link / session for the target user
    const admin = createAdminClient();

    // Get the target user's email
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", targetUserId)
      .single();

    if (!targetProfile?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a magic link that auto-signs in as the target user
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: targetProfile.email,
      options: {
        redirectTo: `${req.nextUrl.origin}/dashboard`,
      },
    });

    if (linkError || !linkData) {
      return NextResponse.json(
        { error: linkError?.message || "Failed to generate link" },
        { status: 500 }
      );
    }

    // The hashed_token can be used to construct the verification URL
    const verifyUrl = `${req.nextUrl.origin}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=magiclink&next=/dashboard`;

    return NextResponse.json({ url: verifyUrl });
  } catch (err) {
    console.error("Impersonate error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
