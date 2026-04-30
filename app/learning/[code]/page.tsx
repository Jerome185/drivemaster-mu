"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import Exam from "@/components/Exam"
import { getTranslator } from "@/lib/i18n"

export default function LearningCategoryPage() {

  const supabase = createClient()
  const searchParams = useSearchParams()
  const { code } = useParams() as { code: string }

  const lang = (searchParams.get("lang") || "FR").toUpperCase()
  const t = getTranslator(lang)

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchQuestions = async () => {

    setLoading(true)
    setQuestions([])

    const { data, error } = await supabase.rpc(
      "get_learning_questions",
      {
        lang: lang,
        category_code: code,
      }
    )

    if (!error) {
      setQuestions(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchQuestions()
  }, [code, lang])

  if (loading) {
    return <div className="p-10 text-center">{t("loading")}</div>
  }

  if (!questions.length) {
    return <div className="p-10 text-center">{t("noQuestions")}</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Exam
        key={lang}
        questions={questions}
        onRetry={fetchQuestions}
      />
    </div>
  )
}