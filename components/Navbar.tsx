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
  const [user,setUser] = useState<any>(null)
  const [menuOpen,setMenuOpen] = useState(false)

  const { language, setLanguage } = useLanguage()

  useEffect(()=>{
    const loadUser = async ()=>{
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    loadUser()
  },[])

  const logout = async ()=>{
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleLinkClick = () => {
    setMenuOpen(false) // 🔥 ferme le menu après clic
  }

  return (

    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b shadow-sm">

      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">

        <Link href="/" className="text-xl font-bold text-blue-700">
          DriveMaster MU 🚗
        </Link>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-6">

          <Link href="/dashboard">Dashboard</Link>
          <Link href="/learning">Learning</Link>
          <Link href="/official">Official Exam</Link>
          <Link href="/master">Master Mode</Link>

          <select
            value={language}
            onChange={(e)=>{
              const lang = e.target.value
              setLanguage(lang)
              localStorage.setItem("lang",lang)
            }}
            className="border px-2 py-1 rounded"
          >
            <option value="EN">EN</option>
            <option value="FR">FR</option>
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

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-2xl"
          onClick={()=>setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

      </div>

      {/* MOBILE MENU FULL SCREEN */}
      {menuOpen && (
        <div className="md:hidden fixed top-[60px] left-0 w-full bg-white shadow-lg z-40">

          <div className="flex flex-col gap-4 p-4">

            <Link href="/dashboard" onClick={handleLinkClick}>Dashboard</Link>
            <Link href="/learning" onClick={handleLinkClick}>Learning</Link>
            <Link href="/official" onClick={handleLinkClick}>Official Exam</Link>
            <Link href="/master" onClick={handleLinkClick}>Master Mode</Link>

            <select
              value={language}
              onChange={(e)=>{
                const lang = e.target.value
                setLanguage(lang)
                localStorage.setItem("lang",lang)
              }}
              className="border px-2 py-1 rounded"
            >
              <option value="EN">EN</option>
              <option value="FR">FR</option>
            </select>

            {user && (
              <button
                onClick={()=>{
                  logout()
                  setMenuOpen(false)
                }}
                className="bg-red-500 text-white px-3 py-2 rounded"
              >
                Logout
              </button>
            )}

          </div>

        </div>
      )}

    </nav>
  )
}