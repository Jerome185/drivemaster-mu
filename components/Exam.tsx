"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useState, useEffect } from "react"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Question = {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string
  weight: number
  difficulty_level: string
}

export default function Exam({
  questions,
  isMaster = false
}: {
  questions: Question[]
  isMaster?: boolean
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [examFinished, setExamFinished] = useState(false)
  const [failedCritical, setFailedCritical] = useState(false)

  const timePerQuestion = isMaster ? 30 : 60
  const [timeLeft, setTimeLeft] = useState(timePerQuestion)

  const currentQuestion = questions[currentIndex]

  const totalPossibleScore = questions.reduce(
    (sum, q) => sum + q.weight,
    0
  )

  const percentage = Math.round((score / totalPossibleScore) * 100)
  const passThreshold = isMaster ? 85 : 70
  const passed = percentage >= passThreshold && !failedCritical
  
  useEffect(() => {
  if (!examFinished) return

  const saveResult = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) return

    await supabase.from("exam_attempts").insert({
      user_id: user.id,
      exam_level: isMaster ? "master" : "official",
      score,
      total_score: totalPossibleScore,
      percentage,
      passed
    })
  }

  saveResult()
}, [examFinished, score])

  // 🔁 Reset timer when question changes
  useEffect(() => {
    setTimeLeft(timePerQuestion)
  }, [currentIndex])

  // ⏱ Timer countdown
  useEffect(() => {
    if (examFinished) return

    if (timeLeft <= 0) {
      setExamFinished(true)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, examFinished])

  const handleSelect = (option: string) => {
    if (selected || examFinished) return

    setSelected(option)
    setShowResult(true)

    const isCorrect = option === currentQuestion.correct_option

    if (isCorrect) {
      setScore((prev) => prev + currentQuestion.weight)
    } else {
      if (
        currentQuestion.difficulty_level === "critical" ||
        (isMaster && currentQuestion.difficulty_level === "major")
      ) {
        setFailedCritical(true)
        setExamFinished(true)
      }
    }
  }

  const handleNext = () => {
    setSelected(null)
    setShowResult(false)

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setExamFinished(true)
    }
  }

  if (examFinished) {
  return (
    <div className="max-w-xl w-full border p-8 rounded-2xl shadow-lg text-center bg-white">

      <div
        className={`text-4xl font-bold mb-4 ${
          failedCritical || !passed ? "text-red-600" : "text-green-600"
        }`}
      >
        {failedCritical || !passed ? "❌ FAILED" : "🎉 PASSED"}
      </div>

      {failedCritical ? (
        <p className="text-red-600 font-semibold mb-6">
          You failed due to a critical mistake.
        </p>
      ) : (
        <>
          <div className="text-lg mb-2">
            Score: <strong>{score}</strong> / {totalPossibleScore}
          </div>

          <div className="text-lg mb-2">
            Percentage: <strong>{percentage}%</strong>
          </div>

          <div className="text-md mb-6 text-gray-600">
            Minimum required: {passThreshold}%
          </div>

          <div
            className={`font-semibold mb-6 ${
              passed ? "text-green-600" : "text-red-600"
            }`}
          >
            {passed
              ? "Excellent performance. You are ready."
              : "Keep practicing and try again."}
          </div>
        </>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-900 text-white px-4 py-2 rounded"
        >
          Retry Exam
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

  return (
    <div className="max-w-xl w-full border p-6 rounded shadow">
      <p className="text-sm text-gray-500 mb-2">
        Question {currentIndex + 1} of {questions.length}
      </p>

      <p className="text-sm font-semibold text-red-600 mb-4">
        Time left: {timeLeft}s
      </p>

      <h2 className="text-xl font-semibold mb-4">
        {currentQuestion.question_text}
      </h2>

      <div className="space-y-2">
        {["A", "B", "C", "D"].map((letter) => {
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
            <p className="text-green-600 font-semibold">Correct ✅</p>
          ) : (
            <p className="text-red-600 font-semibold">
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
            Next Question
          </button>
        </div>
      )}
    </div>
  )
}