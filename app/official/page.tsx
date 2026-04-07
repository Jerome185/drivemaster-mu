"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import Exam from "@/components/Exam"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Link from "next/link"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OfficialPage(){

  const { language } = useLanguage()
  const router = useRouter()

  const [user,setUser] = useState<any>(null)
  const [profile,setProfile] = useState<any>(null)
  const [questions,setQuestions] = useState<any[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    const loadData = async ()=>{

      // 🔐 USER
      const { data:userData } = await supabase.auth.getUser()

      if(!userData.user){
        setLoading(false)
        return
      }

      setUser(userData.user)

      // 👤 PROFILE
      const { data:profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userData.user.id)
        .single()

      // ⚠️ SI PROFIL N’EXISTE PAS → éviter crash
      if(!profileData){
        setProfile(null)
        setLoading(false)
        return
      }

      setProfile(profileData)

      // 💰 CHECK PREMIUM
      if(profileData.is_premium){

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

  // ⏳ LOADING
  if(loading){
    return(
      <div className="p-10 text-center">
        Loading Official Exam...
      </div>
    )
  }

  // ❌ NOT LOGGED IN
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
          href="/login?redirect=/official"
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Login
        </Link>
      </div>
    )
  }

  // ⚠️ PROFILE MANQUANT (TRÈS IMPORTANT POUR TON BUG ACTUEL)
  if(!profile){
    return(
      <div className="max-w-xl mx-auto p-10 text-center">

        <h1 className="text-2xl font-bold mb-4">
          Setting up your account...
        </h1>

        <p>
          Please refresh the page or try again.
        </p>

      </div>
    )
  }

  // ❌ NOT PREMIUM
  if(!profile.is_premium){
    return(
      <div className="max-w-xl mx-auto p-10 text-center">

        <h1 className="text-3xl font-bold mb-4">
          Official Exam Mode 🔒
        </h1>

        <p className="mb-6">
          Upgrade to Premium to access the Official Exam simulator.
        </p>

        <Link
          href="/premium"
          className="bg-yellow-600 text-white px-6 py-3 rounded"
        >
          Upgrade to Premium
        </Link>

      </div>
    )
  }

  // ✅ PREMIUM USER
  return(
    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
        Official Exam Mode 🟢
      </h1>

      {questions.length === 0 && (
        <p className="text-center mb-4">
          Loading questions...
        </p>
      )}

      <div className="flex justify-center">
        <Exam
          questions={questions}
          isMaster={false}
        />
      </div>

    </div>
  )

}