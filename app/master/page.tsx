"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Exam from '../../components/Exam'
import { useLanguage } from "@/app/contexts/LanguageContext"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MasterPage() {

  const { language } = useLanguage()

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    if (!language) return

    const loadQuestions = async () => {

      try {

        const { data, error } = await supabase.rpc(
          "get_master_exam_questions",
          { lang: language.toUpperCase() }
        )

        if (error) {
          console.error(error)
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

    loadQuestions()

  }, [language])

  // ⏳ LOADING
  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  // ❌ ERROR
  if (error) {
    return <div className="p-10 text-center text-red-600">{error}</div>
  }

  // ⚠️ NO QUESTIONS
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
        <Exam 
          questions={questions} 
          mode="exam" 
          onRetry={() => window.location.reload()} 
/>
      </div>

    </div>
  )
}