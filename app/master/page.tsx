"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Exam from "@/components/Exam"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { getTranslator } from "@/lib/i18n"
import Link from "next/link"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MasterPage() {

  const { language } = useLanguage()
  const t = getTranslator(language)

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

    const isMasterAccess =
      profileData?.premium_status === "active" &&
      profileData?.premium_expires_at &&
      new Date(profileData.premium_expires_at) > new Date() &&
      profileData?.plan?.toLowerCase() === "master"

    if(isMasterAccess){
      const { data, error } = await supabase.rpc(
        "get_master_exam_questions",
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

  const isExpired =
    profile?.premium_expires_at &&
    new Date(profile.premium_expires_at) <= new Date()

  const isMasterAccess =
    profile?.is_premium &&
    profile?.premium_expires_at &&
    new Date(profile.premium_expires_at) > new Date() &&
    profile?.plan === "master"

  // 🔥 USER OFFICIAL → UPSELL MASTER
  if(profile?.plan === "official"){
    return (
      <div className="p-10 text-center space-y-4">

        <h1 className="text-3xl font-bold text-red-700">
          {language === "fr" ? "Mode Master 🔥" : "Master Mode 🔥"}
        </h1>

        <p>
          {language === "fr"
            ? "Passe à Master pour débloquer les examens avancés"
            : "Upgrade to Master to unlock advanced exams"}
        </p>

        <Link
          href="/premium"
          className="bg-red-600 px-6 py-3 text-white rounded"
        >
          {language === "fr"
            ? "Passer à Master"
            : "Upgrade to Master"}
        </Link>
      </div>
    )
  }

  // ❌ NO ACCESS
  if(!isMasterAccess){
    return (
      <div className="p-10 text-center space-y-4">

        <h1 className="text-3xl font-bold">
          Master 🔒
        </h1>

        {isExpired ? (
          <p className="text-red-600">
            {language === "fr"
              ? "Ton accès a expiré"
              : "Your access expired"}
          </p>
        ) : (
          <p>
            {language === "fr"
              ? "Passe à Master pour accéder"
              : "Upgrade to Master"}
          </p>
        )}

        <Link
          href="/premium"
          className="bg-red-600 px-6 py-3 text-white rounded"
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
    <div className="p-8 max-w-4xl mx-auto">

      <h1 className="text-3xl text-center mb-6 font-bold text-red-700">
        {language === "fr"
          ? "Mode Master 🔥"
          : "Master Mode 🔥"}
      </h1>

      <Exam
        key={language}
        questions={questions}
        onRetry={loadData} // ✅ clean retry
      />

    </div>
  )
}