"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useState, useEffect } from "react"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Question = {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string
  weight: number
  difficulty_level: string
  image_url?: string
}

export default function Exam({
  questions,
  isMaster = false
}: {
  questions: Question[]
  isMaster?: boolean
}) {

  // 🔥 PROTECTION CRITIQUE
  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-xl w-full border p-8 rounded shadow bg-white text-center">
        <p>No questions available.</p>
      </div>
    )
  }

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [examFinished, setExamFinished] = useState(false)

  const [isPremium, setIsPremium] = useState(false)

  const timePerQuestion = isMaster ? 30 : 60
  const [timeLeft, setTimeLeft] = useState(timePerQuestion)

  const currentQuestion = questions[currentIndex]

  // 🔥 PROTECTION
  if (!currentQuestion) {
    return <div className="p-10 text-center">Loading question...</div>
  }

  const totalPossibleScore = (questions || []).reduce(
    (sum, q) => sum + (q.weight || 0),
    0
  )

  const percentage =
    totalPossibleScore > 0
      ? Math.round((score / totalPossibleScore) * 100)
      : 0

  const passThreshold = isMaster ? 85 : 70
  const passed = percentage >= passThreshold

  // 🔐 LOAD USER PROFILE
  useEffect(() => {

    const loadProfile = async () => {

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from("users")
        .select("is_premium, premium_expires_at")
        .eq("id", session.user.id)
        .single()

      const isPremiumValid =
        data?.is_premium &&
        (!data?.premium_expires_at ||
          new Date(data.premium_expires_at) > new Date())

      setIsPremium(isPremiumValid)
    }

    loadProfile()

  }, [])

  // ⏱ TIMER RESET
  useEffect(() => {
    setTimeLeft(timePerQuestion)
  }, [currentIndex])

  // ⏱ TIMER
  useEffect(() => {

    if (examFinished) return

    if (timeLeft <= 0) {
      setExamFinished(true)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(interval)

  }, [timeLeft, examFinished])

  // 🧠 UPDATE USER STATS
  const updateStats = async (isCorrect: boolean) => {

    if (!currentQuestion) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const userId = session.user.id

    const { data: existing } = await supabase
      .from("user_question_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("question_id", currentQuestion.id)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("user_question_stats")
        .update({
          wrong_count: isCorrect
            ? existing.wrong_count
            : existing.wrong_count + 1,
          correct_count: isCorrect
            ? existing.correct_count + 1
            : existing.correct_count
        })
        .eq("id", existing.id)
    } else {
      await supabase
        .from("user_question_stats")
        .insert({
          user_id: userId,
          question_id: currentQuestion.id,
          wrong_count: isCorrect ? 0 : 1,
          correct_count: isCorrect ? 1 : 0
        })
    }
  }

  // ✅ SELECT ANSWER
  const handleSelect = (option: string) => {

    if (selected || examFinished || !currentQuestion) return

    setSelected(option)
    setShowResult(true)

    const isCorrect = option === currentQuestion.correct_option

    updateStats(isCorrect)

    if (isCorrect) {
      setScore(prev => prev + (currentQuestion.weight || 0))
    }
  }

  // 🔒 NEXT QUESTION
  const handleNext = async () => {

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const userId = session.user.id

    const { data: user } = await supabase
      .from("users")
      .select("daily_questions_count, last_question_date, is_premium, premium_expires_at")
      .eq("id", userId)
      .single()

    const today = new Date().toISOString().split("T")[0]

    let count = user?.daily_questions_count || 0

    if (user?.last_question_date !== today) {
      count = 0
    }

    const isPremiumValid =
      user?.is_premium &&
      (!user?.premium_expires_at ||
        new Date(user.premium_expires_at) > new Date())

    if (!isPremiumValid && count >= 10) {
      alert("🚀 Free limit reached (10 questions/day). Upgrade to continue.")
      window.location.href = "/premium"
      return
    }

    await supabase
      .from("users")
      .update({
        daily_questions_count: count + 1,
        last_question_date: today
      })
      .eq("id", userId)

    setSelected(null)
    setShowResult(false)

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setExamFinished(true)
    }
  }

  // 🏁 RESULT
  if (examFinished) {
    return (
      <div className="max-w-xl w-full border p-8 rounded shadow bg-white text-center">

        <h2 className={`text-3xl font-bold mb-4 ${
          passed ? "text-green-600" : "text-red-600"
        }`}>
          {passed ? "🎉 PASSED" : "❌ FAILED"}
        </h2>

        <p className="mb-2">
          Score: {score} / {totalPossibleScore}
        </p>

        <p className="mb-6">
          Percentage: {percentage}%
        </p>

        <button
          onClick={() => window.location.reload()}
          className="bg-blue-900 text-white px-4 py-2 rounded"
        >
          Retry
        </button>

      </div>
    )
  }

  // 🎮 MAIN UI
  return (

    <div className="max-w-xl w-full border p-6 rounded shadow bg-white">

      {!isPremium && (
        <p className="text-sm text-orange-500 mb-2 text-center">
          Free limit: 10 questions/day
        </p>
      )}

      <p className="text-sm text-gray-500 mb-2">
        Question {currentIndex + 1} / {questions.length}
      </p>

      <p className="text-sm text-red-600 mb-4">
        Time left: {timeLeft}s
      </p>

      <h2 className="text-xl font-semibold mb-4">
        {currentQuestion.question_text}
      </h2>

      {currentQuestion.image_url && (
        <img src={currentQuestion.image_url} className="my-4 w-40 mx-auto"/>
      )}

      <div className="space-y-2">

        {["A","B","C","D"].map(letter => {

          const optionText =
            currentQuestion[`option_${letter.toLowerCase()}` as keyof Question] as string

          return (
            <button
              key={letter}
              onClick={() => handleSelect(letter)}
              className="w-full text-left border p-2 rounded hover:bg-gray-100"
            >
              {letter}. {optionText}
            </button>
          )
        })}

      </div>

      {showResult && (

        <div className="mt-4">

          {selected === currentQuestion.correct_option ? (
            <p className="text-green-600">Correct ✅</p>
          ) : (
            <p className="text-red-600">
              Incorrect ❌ — Correct answer: {currentQuestion.correct_option}
            </p>
          )}

          <p className="mt-2 text-sm text-gray-600">
            {currentQuestion.explanation}
          </p>

          <button
            onClick={handleNext}
            className="mt-4 bg-blue-900 text-white px-4 py-2 rounded"
          >
            Next
          </button>

        </div>

      )}

    </div>
  )
}