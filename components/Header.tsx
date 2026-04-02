"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "../app/contexts/LanguageContext"

export default function Header() {
  const router = useRouter()
  const { language, setLanguage } = useLanguage()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [user, setUser] = useState<any>(null)

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
    router.refresh()
    router.push("/login")
  }

  return (
    <header className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-3 bg-gray-100 shadow-sm">

      {/* LOGO */}
      <Link href="/" className="font-bold text-lg md:text-xl text-blue-700">
        DriveMaster MU 🚗
      </Link>

      {/* NAVIGATION */}
      <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 mt-2 md:mt-0 text-sm">

        {/* MAIN NAV */}
        <Link href="/learning">Learning</Link>
        <Link href="/official">Official</Link>
        <Link href="/master">Master</Link>

        {user && (
          <Link href="/dashboard" className="text-blue-700 font-semibold">
            {language === "fr" ? "Tableau de bord" : "Dashboard"}
          </Link>
        )}

        {/* LANGUAGE SWITCH */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
          className="border rounded px-2 py-1 text-xs"
        >
          <option value="en">EN</option>
          <option value="fr">FR</option>
        </select>

        {/* AUTH */}
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs"
          >
            {language === "fr" ? "Déconnexion" : "Logout"}
          </button>
        ) : (
          <Link
            href="/login"
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs"
          >
            {language === "fr" ? "Connexion" : "Login"}
          </Link>
        )}
      </div>
    </header>
  )
}