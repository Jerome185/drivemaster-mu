"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import Exam from "@/components/Exam"
import { useLanguage } from "@/app/context/LanguageContext"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MasterPage() {

  const router = useRouter()
  const { language } = useLanguage()

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const init = async () => {

      try {
        // 🔐 1. CHECK SESSION
        const { data: { session }, error: sessionError } =
          await supabase.auth.getSession()

        if (sessionError || !session) {
          console.log("No session → redirect login")
          router.push("/login")
          return
        }

        const userId = session.user.id

        // 👤 2. GET USER PROFILE
        let { data: profile, error: profileError } = await supabase
          .from("users")
          .select("is_premium, premium_until")
          .eq("id", userId)
          .single()

        // 🧠 3. AUTO CREATE PROFILE IF NOT EXISTS
        if (profileError || !profile) {
          console.log("Creating user profile...")

          await supabase.from("users").insert({
            id: userId,
            is_premium: false
          })

          profile = {
            is_premium: false,
            premium_until: null
          }
        }

        // 💰 4. CHECK PREMIUM VALIDITY
        const now = new Date()
        const isPremiumActive =
          profile.is_premium &&
          (!profile.premium_until ||
            new Date(profile.premium_until) > now)

        if (!isPremiumActive) {
          console.log("Not premium → redirect premium")
          router.push("/premium")
          return
        }

        // 📚 5. LOAD MASTER QUESTIONS
        const { data, error } = await supabase.rpc(
          "get_master_exam_questions",
          { lang: language }
        )

        if (error) {
          console.error("RPC error:", error)
        }

        setQuestions(data || [])

      } catch (err) {
        console.error("Unexpected error:", err)
      }

      setLoading(false)
    }

    init()

  }, [language, router])

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading Master Mode...
      </div>
    )
  }

  // ❌ NO QUESTIONS
  if (questions.length === 0) {
    return (
      <div className="p-10 text-center">
        No questions available for Master Mode.
      </div>
    )
  }

  // ✅ MAIN UI
  return (
    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-3xl font-bold text-center mb-6 text-red-700">
        Master Mode 🔥
      </h1>

      <div className="flex justify-center">
        <Exam
          questions={questions}
          isMaster={true}
        />
      </div>

    </div>
  )
}