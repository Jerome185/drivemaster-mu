"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translations } from "@/lib/translations"

export default function Header() {

  const router = useRouter()
  const { language, setLanguage } = useLanguage()
  const t = translations[language]

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = user?.email === "jerome.moorghen@gmail.com"

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()

    const { data: authListener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="bg-gray-100 shadow-sm">

      {/* TOP BAR */}
      <div className="flex justify-between items-center px-4 py-3">

        <Link href="/" className="font-bold text-lg text-blue-700">
          DriveMaster MU 🚗
        </Link>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-6">

          <Link href="/learning">{t.learning}</Link>
          <Link href="/official">{t.official}</Link>
          <Link href="/master">{t.master}</Link>

          {user && <Link href="/dashboard">{t.dashboard}</Link>}

          {isAdmin && (
            <Link href="/admin" className="text-purple-600 font-semibold">
              {t.admin}
            </Link>
          )}

          {/* LANGUAGE */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
          </select>

          {/* AUTH */}
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              {t.logout}
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              {t.login}
            </Link>
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
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 border-t">

          <Link href="/learning" onClick={() => setMenuOpen(false)}>
            {t.learning}
          </Link>

          <Link href="/official" onClick={() => setMenuOpen(false)}>
            {t.official}
          </Link>

          <Link href="/master" onClick={() => setMenuOpen(false)}>
            {t.master}
          </Link>

          {user && (
            <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
              {t.dashboard}
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}>
              {t.admin}
            </Link>
          )}

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
          </select>

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-2 rounded"
            >
              {t.logout}
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="bg-blue-600 text-white px-3 py-2 rounded"
            >
              {t.login}
            </Link>
          )}
        </div>
      )}
    </header>
  )
}