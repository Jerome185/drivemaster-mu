"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { useLanguage } from "@/app/contexts/LanguageContext"

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

  const changeLanguage = (lang: "en" | "fr") => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">

        <Link href="/" className="text-xl font-bold text-blue-700">
          DriveMaster MU 🚗
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/learning">Learning</Link>
          <Link href="/official">Official</Link>
          <Link href="/master">Master</Link>

          {/* LANGUAGE */}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value as "en" | "fr")}
            className="border px-2 py-1 rounded"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
          </select>

          {user && (
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}