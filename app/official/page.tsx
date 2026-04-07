"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Link from "next/link"
import Exam from "@/components/Exam"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OfficialPage(){

  const { language } = useLanguage()

  const [user,setUser] = useState<any>(null)
  const [profile,setProfile] = useState<any>(null)
  const [questions,setQuestions] = useState<any[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(() => {

    const loadData = async () => {

      try {

        // 🔐 USER
        const { data:userData } = await supabase.auth.getUser()

        if(!userData.user){
          setLoading(false)
          return
        }

        setUser(userData.user)

        // 👤 PROFILE
        let { data:profileData } = await supabase
          .from("users")
          .select("*")
          .eq("id", userData.user.id)
          .single()

        // 🔥 AUTO CREATE PROFILE SI MANQUANT
        if(!profileData){
          const { data:newProfile } = await supabase
            .from("users")
            .insert({
              id: userData.user.id,
              email: userData.user.email,
              is_premium: false
            })
            .select()
            .single()

          profileData = newProfile
        }

        setProfile(profileData)

        // 💰 SI PREMIUM → LOAD QUESTIONS
        if(profileData?.is_premium){

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

      } catch(err){
        console.error("LOAD ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()

  }, [language])

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
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Login
        </Link>
      </div>
    )
  }

  // ❌ NOT PREMIUM
  if(!profile?.is_premium){
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

  // ❌ NO QUESTIONS (anti-crash)
  if(!questions || questions.length === 0){
    return(
      <div className="p-10 text-center">
        No questions available for this language.
      </div>
    )
  }

  // ✅ OK
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