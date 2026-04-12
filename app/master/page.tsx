"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Exam from "@/components/Exam"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MasterPage() {

  const { language } = useLanguage()
  const router = useRouter()

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    if (!language) return // 🔥 évite crash

    const loadData = async () => {

      try {

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        const user = session.user

        // 🔐 LOAD PROFILE
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("is_premium, premium_expires_at, premium_status")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error(profileError)
          setError("Failed to load profile")
          setLoading(false)
          return
        }

        setProfile(profileData)

        const isPremiumValid =
          profileData?.is_premium &&
          profileData?.premium_status === "active" &&
          (!profileData?.premium_expires_at ||
            new Date(profileData.premium_expires_at) > new Date())

        // ❌ pas premium → stop ici
        if (!isPremiumValid) {
          setLoading(false)
          return
        }

        // 📥 LOAD QUESTIONS
        const { data, error: rpcError } = await supabase.rpc(
          "get_master_exam_questions",
          { lang: language.toLowerCase() } // 🔥 important
        )

        if (rpcError) {
          console.error("RPC ERROR:", rpcError)
          setError("Failed to load questions")
          setLoading(false)
          return
        }

        setQuestions(data || [])
        setLoading(false)

      } catch (err) {
        console.error(err)
        setError("Unexpected error")
        setLoading(false)
      }

    }

    loadData()

  }, [language, router])

  // ⏳ LOADING
  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  // ❌ ERROR
  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        {error}
      </div>
    )
  }

  // 🔒 NOT PREMIUM
  if (!profile?.is_premium || profile?.premium_status !== "active") {
    return (
      <div className="max-w-xl mx-auto p-10 text-center">

        <h1 className="text-3xl font-bold mb-4">Master Mode 🔒</h1>

        {profile?.premium_status === "pending" && (
          <p className="text-orange-500 mb-4">
            Payment under validation ⏳
          </p>
        )}

        {profile?.premium_status === "rejected" && (
          <p className="text-red-500 mb-4">
            Payment rejected ❌
          </p>
        )}

        {!profile?.premium_status && (
          <p className="mb-4">
            Upgrade to access Master Mode
          </p>
        )}

        <Link
          href="/premium"
          className="bg-yellow-600 text-white px-6 py-3 rounded"
        >
          Upgrade 🚀
        </Link>

      </div>
    )
  }

  // 🎯 NO QUESTIONS
  if (!questions.length) {
    return (
      <div className="p-10 text-center">
        No questions available
      </div>
    )
  }

  // 🎮 MAIN
  return (
    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-3xl font-bold text-center mb-6 text-red-800">
        Master Mode 🔥
      </h1>

      <div className="flex justify-center">
        <Exam questions={questions} isMaster={true} />
      </div>

    </div>
  )
}