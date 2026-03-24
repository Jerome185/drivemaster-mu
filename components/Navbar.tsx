"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { useLanguage } from "@/app/context/LanguageContext"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Navbar() {

  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const { language, setLanguage } = useLanguage()

  // 🔐 LOAD SESSION + PROFILE
  useEffect(() => {

    const loadSession = async () => {

      const { data: { session } } = await supabase.auth.getSession()

      const currentUser = session?.user || null
      setUser(currentUser)

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("users")
          .select("is_admin, is_premium")
          .eq("id", currentUser.id)
          .single()

        setProfile(profileData)
      }
    }

    loadSession()

    // 🔁 LISTENER LOGIN / LOGOUT
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {

        const currentUser = session?.user || null
        setUser(currentUser)

        if (currentUser) {
          const { data: profileData } = await supabase
            .from("users")
            .select("is_admin, is_premium")
            .eq("id", currentUser.id)
            .single()

          setProfile(profileData)
        } else {
          setProfile(null)
        }

      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const changeLanguage = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem("lang", lang)
  }

  const closeMenu = () => setMenuOpen(false)

  return (

    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b shadow-sm">

      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">

        <Link href="/" className="text-xl font-bold text-blue-700">
          DriveMaster MU 🚗
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6">

          <Link href="/dashboard">Dashboard</Link>
          <Link href="/learning">Learning</Link>
          <Link href="/official">Official</Link>
          <Link href="/master">Master</Link>

          {/* ADMIN */}
          {profile?.is_admin && (
            <Link href="/admin" className="text-purple-600 font-semibold">
              Admin
            </Link>
          )}

          {/* LANGUAGE */}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="EN">EN</option>
            <option value="FR">FR</option>
          </select>

          {/* USER */}
          {user && (
            <div className="flex items-center gap-3">

              <span className="text-sm text-gray-600 hidden lg:block">
                {user.email}
              </span>

              {/* PREMIUM BADGE */}
              {profile?.is_premium && (
                <span className="bg-yellow-400 text-xs px-2 py-1 rounded">
                  Premium
                </span>
              )}

              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Logout
              </button>

            </div>
          )}

        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden fixed top-[60px] left-0 w-full bg-white shadow-lg z-40">

          <div className="flex flex-col gap-4 p-4">

            <Link href="/dashboard" onClick={closeMenu}>Dashboard</Link>
            <Link href="/learning" onClick={closeMenu}>Learning</Link>
            <Link href="/official" onClick={closeMenu}>Official</Link>
            <Link href="/master" onClick={closeMenu}>Master</Link>

            {/* ADMIN */}
            {profile?.is_admin && (
              <Link href="/admin" onClick={closeMenu} className="text-purple-600 font-semibold">
                Admin
              </Link>
            )}

            {/* LANGUAGE */}
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="EN">EN</option>
              <option value="FR">FR</option>
            </select>

            {/* USER */}
            {user && (
              <>
                <p className="text-sm text-gray-600">
                  {user.email}
                </p>

                {profile?.is_premium && (
                  <span className="bg-yellow-400 text-xs px-2 py-1 rounded w-fit">
                    Premium
                  </span>
                )}

                <button
                  onClick={() => {
                    logout()
                    closeMenu()
                  }}
                  className="bg-red-500 text-white px-3 py-2 rounded"
                >
                  Logout
                </button>
              </>
            )}

          </div>

        </div>
      )}

    </nav>
  )
}