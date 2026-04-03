"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter, useSearchParams } from "next/navigation"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage(){

  const router = useRouter()
  const searchParams = useSearchParams()

  const redirect = searchParams.get("redirect") || "/"

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")

  const handleLogin = async () => {

    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if(error){
      setError(error.message)
      setLoading(false)
      return
    }

    // ✅ REDIRECTION INTELLIGENTE
    router.push(redirect)

  }

  return(

    <div className="max-w-md mx-auto mt-20 p-6 border rounded">

      <h1 className="text-2xl font-bold mb-6 text-center">
        DriveMaster Login 🚗
      </h1>

      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-3 p-2 border rounded"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-4 p-2 border rounded"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        {loading ? "Loading..." : "Login"}
      </button>

    </div>

  )

}