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

  if(loading) return <div className="p-10 text-center">Loading...</div>

  if(!user){
    return (
      <div className="p-10 text-center">
        <h1>Login Required 🔐</h1>
        <Link href="/login">Login</Link>
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

  // 🔥 USER OFFICIAL → PROPOSE UPGRADE
  if(profile?.plan === "official"){
    return (
      <div className="p-10 text-center">

        <h1 className="text-3xl mb-4">Master Mode 🔥</h1>

        <p className="mb-6">
          Upgrade to Master to unlock advanced exams
        </p>

        <Link href="/premium" className="bg-red-600 px-6 py-3 text-white rounded">
          Upgrade to Master
        </Link>
      </div>
    )
  }

  if(!isMasterAccess){
    return (
      <div className="p-10 text-center">

        <h1 className="text-3xl mb-4">Master 🔒</h1>

        {isExpired ? (
          <p className="text-red-600 mb-6">Your access expired</p>
        ) : (
          <p className="mb-6">Upgrade to Master</p>
        )}

        <Link href="/premium" className="bg-red-600 px-6 py-3 text-white rounded">
          Upgrade
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">

      <h1 className="text-3xl text-center mb-4 text-red-700">
        Master Mode 🔥
      </h1>

      <Exam
        questions={questions}
        mode="exam"
        onRetry={() => window.location.reload()}
      />

    </div>
  )
}