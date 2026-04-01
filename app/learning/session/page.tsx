"use client"

export const dynamic = "force-dynamic"
export const revalidate = 0

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "../../contexts/LanguageContext"

type Translation = {
  language_code: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation?: string
}

type Question = {
  id: number
  sign?: {
    image_url?: string
  }[] // ✅ FIX IMPORTANT (tableau)
  question_translations: Translation[]
}

export default function LearningSessionPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const categoryId = searchParams.get("categoryId")

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)

      const langCode = language.toUpperCase()

      const { data, error } = await supabase
        .from("questions")
        .select(`
          id,
          sign:sign_id (image_url),
          question_translations!inner (
            language_code,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            explanation
          )
        `)
        .eq("category_id", categoryId)
        .eq("question_translations.language_code", langCode)
        .eq("is_active", true)
        .limit(30)

      if (error) {
        console.error("Supabase error:", error)
      } else {
        setQuestions((data as Question[]) || [])
      }

      setLoading(false)
    }

    if (categoryId) {
      fetchQuestions()
    }
  }, [categoryId, language])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading questions...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No questions found.</p>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const translation = currentQuestion.question_translations[0]

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const nextQuestion = () => {
    setSelectedAnswer(null)
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const getOption = (opt: string) => {
    const map: any = {
      A: translation.option_a,
      B: translation.option_b,
      C: translation.option_c,
      D: translation.option_d,
    }
    return map[opt]
  }

  return (
    <div className="max-w-2xl mx-auto p-6">

      {/* DEBUG (optionnel) */}
      <p className="text-xs text-gray-400 mb-2">
        UI: {language} | DB: {translation.language_code}
      </p>

      {/* QUESTION COUNT */}
      <p className="text-sm text-gray-500 mb-2">
        Question {currentIndex + 1} / {questions.length}
      </p>

      {/* QUESTION */}
      <h1 className="text-xl font-semibold mb-4">
        {translation.question_text}
      </h1>

      {/* IMAGE (FIX ARRAY) */}
      {currentQuestion.sign?.[0]?.image_url && (
        <img
          src={currentQuestion.sign[0].image_url}
          alt="Traffic sign"
          className="mb-4 rounded-lg max-h-64 object-contain"
        />
      )}

      {/* OPTIONS */}
      <div className="grid gap-3">
        {["A", "B", "C", "D"].map((opt) => {
          const isCorrect = opt === translation.correct_option
          const isSelected = selectedAnswer === opt

          let bg = "bg-gray-100"

          if (selectedAnswer) {
            if (isCorrect) bg = "bg-green-300"
            else if (isSelected) bg = "bg-red-300"
          }

          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className={`p-3 rounded text-left ${bg}`}
            >
              <strong>{opt}.</strong> {getOption(opt)}
            </button>
          )
        })}
      </div>

      {/* RESULT */}
      {selectedAnswer && (
        <div className="mt-4">
          <p className="font-semibold">
            {selectedAnswer === translation.correct_option
              ? "Correct ✅"
              : "Incorrect ❌"}
          </p>

          {translation.explanation && (
            <div className="mt-2 p-3 bg-gray-100 rounded">
              <p className="text-sm">{translation.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* NEXT */}
      {selectedAnswer && (
        <button
          onClick={nextQuestion}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      )}
    </div>
  )
}