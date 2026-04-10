import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SUPABASE_URL ? "https://scheduling-coral-five.vercel.app" : "http://localhost:3000"));

  // Clear all supabase cookies
  response.cookies.delete("sb-xprmicanpxnjrkykhobx-auth-token");
  response.cookies.delete("sb-xprmicanpxnjrkykhobx-auth-token.0");
  response.cookies.delete("sb-xprmicanpxnjrkykhobx-auth-token.1");

  return response;
}
