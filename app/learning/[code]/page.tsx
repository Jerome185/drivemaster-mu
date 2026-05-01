"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { getTranslator } from "@/lib/i18n"
import Exam from "@/components/Exam"

export default function LearningCategoryPage() {

  const supabase = createClient()
  const { code } = useParams() as { code: string }

  const { language } = useLanguage()
  const lang = language.toUpperCase()
  const t = getTranslator(language)

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchQuestions = async () => {

    setLoading(true)
    setQuestions([]) // 🔥 reset

    try {
      const { data, error } = await supabase.rpc(
        "get_learning_questions",
        {
          lang: lang,
          category_code: code,
        }
      )

      if (error) {
        console.error("RPC ERROR:", error)
        setQuestions([])
      } else {
        setQuestions(data || [])
      }

    } catch (err) {
      console.error("LOAD ERROR:", err)
      setQuestions([])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (!code || !language) return
    fetchQuestions()
  }, [code, language]) // ✅ FIX MAJEUR

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="p-10 text-center">
        {t("loading")}
      </div>
    )
  }

  // ❌ NO QUESTIONS
  if (!questions.length) {
    return (
      <div className="p-10 text-center">
        {t("noQuestions")}
      </div>
    )
  }

  // ✅ MAIN
  return (
    <div className="max-w-4xl mx-auto p-6">

      <Exam
        key={language} // 🔥 force re-render
        questions={questions}
        onRetry={fetchQuestions}
      />

    </div>
  )
}