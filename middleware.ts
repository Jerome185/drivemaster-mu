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

  // 🔐 SESSION
  const { data: { session } } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")

  const isProtected =
    pathname.startsWith("/master") ||
    pathname.startsWith("/dashboard")

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
  // 🔥 PREMIUM CHECK (MASTER)
  // =========================
  if (session && pathname.startsWith("/master")) {

    const { data: user } = await supabase
      .from("users")
      .select("is_premium, premium_status")
      .eq("id", session.user.id)
      .single()

    const isPremium =
      user?.is_premium &&
      user?.premium_status === "active"

    if (!isPremium) {
      return NextResponse.redirect(new URL("/premium", req.url))
    }
  }

  return res
}