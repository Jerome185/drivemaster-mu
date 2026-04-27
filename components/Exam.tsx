'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Question = {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string
  image_url?: string | null
}

type ExamProps = {
  questions: Question[]
  mode?: 'learning' | 'exam'
  onRetry?: () => void
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Exam({ questions, mode = 'learning', onRetry }: ExamProps) {

  const isExam = mode === 'exam'

  // 🔥 SAFE QUESTIONS
  const safeQuestions = Array.from(
    new Map(questions.map(q => [q.id, q])).values()
  ).slice(0, isExam ? 35 : 10)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const [timeLeft, setTimeLeft] = useState(1800)
  const [saved, setSaved] = useState(false)

  const currentQuestion = safeQuestions[currentIndex]

  // ⏱ TIMER
  useEffect(() => {
    if (!isExam || showResult) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowResult(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isExam, showResult])

  const formatTime = (sec: number) => {
    const min = Math.floor(sec / 60)
    const s = sec % 60
    return `${min}:${s.toString().padStart(2, '0')}`
  }

  const handleAnswer = (option: string) => {
    if (selected) return

    setSelected(option)

    if (option === currentQuestion.correct_option) {
      setScore(prev => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 < safeQuestions.length) {
      setCurrentIndex(prev => prev + 1)
      setSelected(null)
    } else {
      setShowResult(true)
    }
  }

  // 💾 SAVE ATTEMPT
  const saveAttempt = async (score: number, total: number) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const percentage = Math.round((score / total) * 100)
    const passed = score >= 30

    await supabase.from('exam_attempts').insert({
      user_id: userData.user.id,
      exam_level: 'official',
      score: score,
      total_score: total,
      percentage: percentage,
      passed: passed
    })
  }

  // 🔒 SAVE ONCE
  useEffect(() => {
    if (showResult && isExam && !saved) {
      saveAttempt(score, safeQuestions.length)
      setSaved(true)
    }
  }, [showResult])

  // 🎯 RESULT
  if (showResult) {

    const total = safeQuestions.length
    const percentage = Math.round((score / total) * 100)
    const passed = isExam ? score >= 30 : true

    return (
      <div className="text-center">

        <h2 className="text-3xl font-bold mb-4">
          {isExam
            ? passed
              ? '✅ PASSED'
              : '❌ FAILED'
            : 'Résultat'}
        </h2>

        <p className="text-lg mb-2">
          Score: {score} / {total}
        </p>

        <p className="text-gray-600 mb-4">
          {percentage}%
        </p>

        {isExam && (
          <p className="mb-6">
            {passed
              ? 'Congratulations! You passed the exam.'
              : 'You did not reach the passing score (30).'}
          </p>
        )}

        <button
          onClick={() => onRetry?.()}
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Recommencer
        </button>

      </div>
    )
  }

  return (
    <div className="bg-white shadow p-6 rounded-lg max-w-2xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between mb-4 text-sm font-semibold">
        <span>
          Question {currentIndex + 1} / {safeQuestions.length}
        </span>

        {isExam && (
          <span className="text-red-600">
            ⏱ {formatTime(timeLeft)}
          </span>
        )}
      </div>

      {/* QUESTION */}
      <h2 className="text-lg font-semibold mb-4">
        {currentQuestion.question_text}
      </h2>

      {/* IMAGE */}
      {currentQuestion.image_url && (
        <img
          src={currentQuestion.image_url}
          alt="question"
          className="mb-4 max-h-60 mx-auto"
        />
      )}

      {/* OPTIONS */}
      <div className="grid gap-3">
        {(['A', 'B', 'C', 'D'] as const).map((key) => {

          const optionText =
            currentQuestion[`option_${key.toLowerCase()}` as keyof Question] as string

          const isCorrect = key === currentQuestion.correct_option
          const isSelected = selected === key

          let style = "border p-3 rounded text-left"

          if (selected) {
            if (isCorrect) style += " bg-green-200"
            else if (isSelected) style += " bg-red-200"
          } else {
            style += " hover:bg-gray-100"
          }

          return (
            <button
              key={key}
              onClick={() => handleAnswer(key)}
              className={style}
            >
              <span className="font-bold mr-2">{key}.</span>
              {optionText}
            </button>
          )
        })}
      </div>

      {/* EXPLANATION */}
      {!isExam && selected && (
        <div className="mt-4 text-sm text-gray-700">
          <strong>Explication:</strong> {currentQuestion.explanation}
        </div>
      )}

      {/* NEXT */}
      {selected && (
        <button
          onClick={handleNext}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {isExam ? 'Next' : 'Suivant'}
        </button>
      )}

    </div>
  )
}