"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Exam from "@/components/Exam"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LearningCategoryPage() {

  const { categoryId } = useParams()
  const { language } = useLanguage()

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    if (!categoryId || !language) return

    const loadQuestions = async () => {

      const { data, error } = await supabase
        .from("questions")
        .select(`
          id,
          category_id,
          question_translations (
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            explanation,
            language_code
          )
        `)
        .eq("category_id", categoryId)

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      // 🔥 FILTER PAR LANGUE + FORMAT EXAM
      const formatted = data
        ?.map(q => {
          const t = q.question_translations.find(
            (tr: any) => tr.language_code === language.toLowerCase()
          )

          if (!t) return null

          return {
            id: q.id,
            question_text: t.question_text,
            option_a: t.option_a,
            option_b: t.option_b,
            option_c: t.option_c,
            option_d: t.option_d,
            correct_option: t.correct_option,
            explanation: t.explanation,
            weight: 1,
            difficulty_level: "minor"
          }
        })
        .filter(Boolean)

      setQuestions(formatted || [])
      setLoading(false)
    }

    loadQuestions()

  }, [categoryId, language])

  // ⏳ LOADING
  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  // ❌ AUCUNE QUESTION
  if (!questions.length) {
    return (
      <div className="p-10 text-center">
        No questions available for this category
      </div>
    )
  }

  // 🎯 MAIN
  return (
    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-2xl font-bold mb-6">
        Learning Mode 📚
      </h1>

      <div className="flex justify-center">
        <Exam questions={questions} />
      </div>

    </div>
  )
}