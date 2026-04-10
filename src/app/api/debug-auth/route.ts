import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll().map((c) => ({ name: c.name, valueLen: c.value.length }));

  const supabase = createServerClient(
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

  const { data, error } = await supabase.auth.getUser();

  return NextResponse.json({
    envHasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    envHasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    cookieCount: allCookies.length,
    sbCookies: allCookies.filter((c) => c.name.startsWith("sb-")),
    user: data?.user ? { id: data.user.id, email: data.user.email } : null,
    error: error ? error.message : null,
  });
}

