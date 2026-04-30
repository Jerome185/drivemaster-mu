"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Exam from "../../components/Exam"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Link from "next/link"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MasterPage() {

  const { language } = useLanguage()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const loadData = async () => {

      setQuestions([]) // 🔥 reset

      const { data:userData } = await supabase.auth.getUser()

      if(!userData.user){
        setLoading(false)
        return
      }

      setUser(userData.user)

      let { data:profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userData.user.id)
        .maybeSingle()

      setProfile(profileData)

      const isMasterAccess =
        profileData?.is_premium &&
        profileData?.premium_expires_at &&
        new Date(profileData.premium_expires_at) > new Date() &&
        profileData?.plan === "master"

      if(isMasterAccess){
        const { data } = await supabase.rpc(
          "get_master_exam_questions",
          { lang: language.toUpperCase() }
        )

        setQuestions(data || [])
      }

      setLoading(false)
    }

    loadData()

  }, [language])

  if(loading){
    return <div className="p-10 text-center">Loading...</div>
  }

  if(!user){
    return (
      <div className="p-10 text-center">
        Login Required 🔐
        <Link href="/login">Login</Link>
      </div>
    )
  }

  if(!questions.length){
    return (
      <div className="p-10 text-center">
        {language === "fr"
          ? "Aucune question disponible"
          : "No questions available"}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-3xl text-center mb-6 text-red-700">
        Master Mode 🔥
      </h1>

      <Exam
        key={language} // 🔥 FORCE RELOAD
        questions={questions}
        mode="exam"
        onRetry={() => window.location.reload()}
      />

    </div>
  )
}