import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// TEMPORARY route - remove after first use
export async function GET() {
  try {
    const admin = createAdminClient();

    // Find the user
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
    if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

    const user = users.find((u) => u.email === "napoles.tomas@gmail.com");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Update password via Admin API
    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      password: "MapaHorario2024!",
      email_confirm: true,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      userId: data.user.id,
      email: data.user.email,
      confirmed: data.user.email_confirmed_at,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
