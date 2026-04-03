"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // 🔥 BONUS : AUTO REDIRECT SI DÉJÀ CONNECTÉ
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        router.push("/")
      }
    }

    checkSession()
  }, [router])

  // 🔐 LOGIN
  const handleLogin = async () => {

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    router.push("/")
  }

  // 🆕 SIGNUP
  const handleSignup = async () => {

    setLoading(true)
    setMessage("")

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    // 🔥 AUTO CREATE PROFILE
    if (user) {
      await supabase.from("users").insert({
        id: user.id,
        is_premium: false,
        premium_until: null
      })
    }

    setMessage("Account created! You can now login.")
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded shadow">

      <h1 className="text-2xl font-bold mb-6 text-center">
        DriveMaster Login 🚗
      </h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />

      <div className="flex flex-col gap-3">

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-700 text-white py-2 rounded"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="bg-green-700 text-white py-2 rounded"
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>

      </div>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-600">
          {message}
        </p>
      )}

    </div>
  )
}