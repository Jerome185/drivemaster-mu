"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "../app/contexts/LanguageContext"

export default function Header() {
  const router = useRouter()
  const { language } = useLanguage()

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
    <header className="flex justify-between items-center px-8 py-4 bg-gray-100 shadow-sm">

      <Link href="/" className="font-bold text-xl text-blue-700">
        DriveMaster MU 🚗
      </Link>

      <div className="flex items-center gap-6">

        {user ? (
          <>
            <Link href="/dashboard" className="text-blue-700 font-semibold">
              {language === "fr" ? "Tableau de bord" : "Dashboard"}
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              {language === "fr" ? "Déconnexion" : "Logout"}
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {language === "fr" ? "Connexion" : "Login"}
          </Link>
        )}

      </div>
    </header>
  )
}