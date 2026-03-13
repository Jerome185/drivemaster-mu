"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Navbar() {

  const router = useRouter()

  const [user,setUser] = useState<any>(null)
  const [language,setLanguage] = useState("EN")

  useEffect(()=>{

    const getUser = async ()=>{

      const { data } = await supabase.auth.getUser()

      setUser(data.user)

    }

    getUser()

  },[])

  const handleLogout = async ()=>{

    await supabase.auth.signOut()

    router.push("/login")

  }

  return (

    <nav className="flex items-center justify-between px-6 py-4 border-b bg-white">

      {/* Logo */}

      <Link
        href="/"
        className="text-xl font-bold text-blue-700"
      >
        DriveMaster MU 🚗
      </Link>

      {/* Navigation */}

      <div className="flex items-center gap-6">

        <Link
          href="/dashboard"
          className="hover:text-blue-600"
        >
          Dashboard
        </Link>

        <Link
          href="/learning"
          className="hover:text-blue-600"
        >
          Learning
        </Link>

        <Link
          href="/official"
          className="hover:text-blue-600"
        >
          Official Exam
        </Link>

        <Link
          href="/master"
          className="hover:text-blue-600"
        >
          Master Mode
        </Link>

        {/* Language selector */}

        <select
          value={language}
          onChange={(e)=>setLanguage(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="EN">EN</option>
          <option value="FR">FR</option>
        </select>

        {/* Logout */}

        {user && (

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>

        )}

      </div>

    </nav>

  )

}