"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Link from "next/link"
import Exam from "@/components/Exam"
import { getTranslator } from "@/lib/i18n"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OfficialPage(){

  const { language } = useLanguage()
  const t = getTranslator(language)

  const [user,setUser] = useState<any>(null)
  const [profile,setProfile] = useState<any>(null)
  const [questions,setQuestions] = useState<any[]>([])
  const [loading,setLoading] = useState(true)

  const loadData = async () => {

    setLoading(true)
    setQuestions([])

    const { data:userData } = await supabase.auth.getUser()

    if(!userData.user){
      setUser(null)
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

    const isOfficialAccess =
      profileData?.is_premium &&
      profileData?.premium_expires_at &&
      new Date(profileData.premium_expires_at) > new Date() &&
      (profileData?.plan === "official" || profileData?.plan === "master")

    if(isOfficialAccess){
      const { data, error } = await supabase.rpc(
        "get_official_exam_questions",
        { lang: language.toUpperCase() }
      )

      if(error){
        console.error("RPC ERROR:", error)
        setQuestions([])
      } else {
        setQuestions(data || [])
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [language])

  // ⏳ LOADING
  if(loading){
    return (
      <div className="p-10 text-center">
        {t("loading")}
      </div>
    )
  }

  // ❌ NOT LOGGED
  if(!user){
    return (
      <div className="p-10 text-center space-y-4">
        <p>{t("loginRequired")} 🔐</p>

        <Link
          href="/login"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {t("login")}
        </Link>
      </div>
    )
  }

  // ❌ NO ACCESS
  const noAccess =
    !profile?.is_premium ||
    !profile?.premium_expires_at ||
    new Date(profile.premium_expires_at) < new Date()

  if(noAccess){
    return (
      <div className="p-10 text-center space-y-4">
        <p>
          {language === "fr"
            ? "Accès Premium requis 🔒"
            : "Premium access required 🔒"}
        </p>

        <Link
          href="/premium"
          className="bg-yellow-600 text-white px-4 py-2 rounded"
        >
          {t("upgrade")}
        </Link>
      </div>
    )
  }

  // ❌ NO QUESTIONS
  if(!questions.length){
    return (
      <div className="p-10 text-center">
        {t("noQuestions")}
      </div>
    )
  }

  // ✅ MAIN
  return (
    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-3xl text-center mb-6 font-bold">
        {language === "fr"
          ? "Mode Officiel 🟢"
          : "Official Mode 🟢"}
      </h1>

      <Exam
        key={language} // 🔥 reset UI propre
        questions={questions}
        onRetry={loadData} // ✅ NO reload
      />

    </div>
  )
}