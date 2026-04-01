"use client"

import { useEffect,useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Exam from "@/components/Exam"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MasterPage(){

  const { language } = useLanguage()
  const router = useRouter()

  const [questions,setQuestions] = useState<any[]>([])
  const [loading,setLoading] = useState(true)
  const [profile,setProfile] = useState<any>(null)

  useEffect(()=>{

    const loadData = async ()=>{

      const { data: { session } } = await supabase.auth.getSession()

      if(!session){
        router.push("/login")
        return
      }

      const user = session.user

      const { data: profileData } = await supabase
        .from("users")
        .select("is_premium, premium_expires_at")
        .eq("id",user.id)
        .single()

      setProfile(profileData)

      const isPremiumValid =
        profileData?.is_premium &&
        (!profileData?.premium_expires_at ||
         new Date(profileData.premium_expires_at) > new Date())

      if(!isPremiumValid){
        setLoading(false)
        return
      }

      const { data } = await supabase.rpc(
        "get_master_exam_questions",
        { lang: language }
      )

      setQuestions(data || [])
      setLoading(false)

    }

    loadData()

  },[language])

  if(loading){
    return <div className="p-10 text-center">Loading...</div>
  }

  if(!profile?.is_premium){
    return(
      <div className="max-w-xl mx-auto p-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Master Mode 🔒</h1>
        <Link href="/premium" className="bg-yellow-600 text-white px-6 py-3 rounded">
          Upgrade 🚀
        </Link>
      </div>
    )
  }

  return(
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-red-700">
        Master Mode 🔥
      </h1>

      {profile?.premium_expires_at && (
        <p className="text-orange-500 text-center mb-4">
          Premium pending validation ⏳
        </p>
      )}

      <Exam questions={questions} isMaster={true}/>
    </div>
  )
}