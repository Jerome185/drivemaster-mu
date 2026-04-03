"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Exam from "@/components/Exam"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Link from "next/link"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OfficialPage(){

  const { language } = useLanguage()

  const [questions,setQuestions] = useState<any[]>([])
  const [loading,setLoading] = useState(true)
  const [isPremium,setIsPremium] = useState(false)
  const [user,setUser] = useState<any>(null) // ✅ AJOUT

  useEffect(()=>{

    const loadData = async ()=>{

      const { data:userData } = await supabase.auth.getUser()

      // ✅ stocker user
      setUser(userData.user)

      if(!userData.user){
        setLoading(false)
        return
      }

      const { data:profile } = await supabase
        .from("users")
        .select("is_premium")
        .eq("id",userData.user.id)
        .single()

      setIsPremium(profile?.is_premium)

      if(profile?.is_premium){

        const { data } = await supabase.rpc(
          "get_official_exam_questions",
          { lang: language }
        )

        setQuestions(data || [])

      }

      setLoading(false)

    }

    loadData()

  },[language])

  // ⏳ Loading
  if(loading){
    return(
      <div className="p-10 text-center">
        Loading Official Exam...
      </div>
    )
  }

  // ❌ NOT LOGGED IN → LOGIN
  if(!user){
    return(
      <div className="max-w-xl mx-auto p-10 text-center">
        <h1 className="text-3xl font-bold mb-4">
          Login Required 🔐
        </h1>

        <p className="mb-6">
          Please login to access the Official Exam.
        </p>

        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Login
        </Link>
      </div>
    )
  }

  // ❌ NOT PREMIUM → PAYWALL
  if(!isPremium){
    return(
      <div className="max-w-xl mx-auto p-10 text-center">

        <h1 className="text-3xl font-bold mb-4">
          Official Exam Mode 🔒
        </h1>

        <p className="mb-6">
          Upgrade to Premium to access the Official Exam simulator.
        </p>

        <Link
        href="/login?redirect=/premium">
          className="bg-yellow-600 text-white px-6 py-3 rounded"
        >
          Upgrade to Premium
        </Link>

      </div>
    )
  }

  // ✅ PREMIUM USER → EXAM
  return(
    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
        Official Exam Mode 🟢
      </h1>

      <div className="flex justify-center">
        <Exam
          questions={questions}
          isMaster={false}
        />
      </div>

    </div>
  )

}