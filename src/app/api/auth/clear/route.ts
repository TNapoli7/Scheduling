import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/login", request.nextUrl.origin));

  // Clear all supabase cookies
  response.cookies.delete("sb-xprmicanpxnjrkykhobx-auth-token");
  response.cookies.delete("sb-xprmicanpxnjrkykhobx-auth-token.0");
  response.cookies.delete("sb-xprmicanpxnjrkykhobx-auth-token.1");

  return response;
}
