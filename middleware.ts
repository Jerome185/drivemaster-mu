"use server"

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(req: NextRequest) {

  let res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")

  const isProtected =
    pathname.startsWith("/official") ||
    pathname.startsWith("/master")

  // =========================
  // 🚫 NOT LOGGED IN
  // =========================
  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // =========================
  // 🔁 ALREADY LOGGED IN
  // =========================
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // =========================
  // 🔐 PLAN CHECK
  // =========================
  if (session && (pathname.startsWith("/official") || pathname.startsWith("/master"))) {

    const { data: user } = await supabase
      .from("users")
      .select("plan")
      .eq("id", session.user.id)
      .single()

    // ❌ FREE → pas accès official/master
    if (user?.plan === "free") {
      return NextResponse.redirect(new URL("/premium", req.url))
    }

    // ❌ OFFICIAL → pas accès master
    if (pathname.startsWith("/master") && user?.plan !== "master") {
      return NextResponse.redirect(new URL("/premium", req.url))
    }
  }

  return res
}

// ⚙️ ROUTES PROTÉGÉES
export const config = {
  matcher: [
    "/official/:path*",
    "/master/:path*",
    "/login",
    "/signup"
  ],
}