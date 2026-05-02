"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translations } from "@/lib/translations"

export default function Header() {

  const router = useRouter()
  const pathname = usePathname()

  const { language, setLanguage } = useLanguage()
  const t = translations[language]

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // ✅ ADMIN VIA DB
  const isAdmin = profile?.is_admin === true

  useEffect(() => {

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        setUser(data.user)

        const { data: profileData } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", data.user.id)
          .single()

        setProfile(profileData)
      } else {
        setUser(null)
        setProfile(null)
      }
    }

    loadUser()

    const { data: listener } =
      supabase.auth.onAuthStateChange(async (_event, session) => {

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const { data: profileData } = await supabase
            .from("users")
            .select("is_admin")
            .eq("id", currentUser.id)
            .single()

          setProfile(profileData)
        } else {
          setProfile(null)
        }
      })

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

const changeLanguage = (lang: "en" | "fr") => {
  setLanguage(lang)

  // ✅ AJOUT COOKIE (clé du fix)
  document.cookie = `language=${lang}; path=/`

  // ✅ garder ton comportement actuel (aucun impact)
  const path = window.location.pathname
  router.push(`${path}?lang=${lang}`)
    router.refresh()
  }

  const linkClass = (path: string) =>
    `transition ${
      pathname === path
        ? "text-blue-700 font-semibold"
        : "text-gray-600 hover:text-blue-600"
    }`

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">

      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">

        <Link href="/" className="text-xl font-bold text-blue-700">
          DriveMaster MU 🚗
        </Link>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-6">

         <Link href="/learning" className={linkClass("/learning")}>
            {t.learning} 🎓
          </Link>

          <Link href="/official" className={linkClass("/official")}>
            {t.official} 🟢
          </Link>

          <Link href="/master" className={linkClass("/master")}>
            {t.master} 🔥
          </Link>

          {user && (
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            {t.dashboard} 📊
          </Link>
        )}

            {isAdmin && (
          <Link href="/admin" className="text-purple-600 font-semibold">
            {t.admin} ⚙️
          </Link>
        )}

          {/* LANG */}
          <div className="flex border rounded overflow-hidden text-sm">
            <button
              onClick={() => changeLanguage("en")}
              className={`px-2 py-1 ${
                language === "en" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage("fr")}
              className={`px-2 py-1 ${
                language === "fr" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              FR
            </button>
          </div>

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              {t.logout}
            </button>
          ) : (
            <Link href="/login" className="bg-blue-600 text-white px-3 py-1 rounded">
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

      {/* MOBILE */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 border-t bg-white">

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

          {/* 🔥 ADMIN MOBILE FIX */}
          {isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}>
              {t.admin}
            </Link>
          )}

          <div className="flex gap-2">
            <button onClick={() => changeLanguage("en")} className="border px-2 py-1 rounded">
              EN
            </button>
            <button onClick={() => changeLanguage("fr")} className="border px-2 py-1 rounded">
              FR
            </button>
          </div>

          {user ? (
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded">
              {t.logout}
            </button>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="bg-blue-600 text-white px-3 py-2 rounded">
              {t.login}
            </Link>
          )}
        </div>
      )}
    </header>
  )
}