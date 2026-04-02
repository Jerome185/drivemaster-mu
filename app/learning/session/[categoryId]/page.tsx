"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useParams } from "next/navigation"
import { useLanguage } from "../../../contexts/LanguageContext"

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
  }
  question_translations: Translation[]
}

export default function LearningSessionPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { language } = useLanguage()
  const params = useParams()
  const categoryId = params.categoryId as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)

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
        .eq("question_translations.language_code", language.toUpperCase())
        .eq("is_active", true)
        .limit(50)

      if (error) {
        console.error("Supabase error:", error)
      } else {
        setQuestions((data as Question[]) || [])
      }

      setLoading(false)
    }

    fetchQuestions()
  }, [categoryId, language])

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>
  }

  if (questions.length === 0) {
    return (
      <p className="text-center mt-10">
        No questions available in {language.toUpperCase()}
      </p>
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

      <p className="text-sm text-gray-500 mb-2">
        Question {currentIndex + 1} / {questions.length}
      </p>

      <h1 className="text-xl font-semibold mb-4">
        {translation.question_text}
      </h1>

      {currentQuestion.sign?.image_url && (
        <img
          src={currentQuestion.sign.image_url}
          alt="Traffic sign"
          className="mb-4 rounded-lg max-h-64 object-contain"
        />
      )}

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