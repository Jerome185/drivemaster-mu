"use client"

import { useState } from "react"

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
  onRetry?: () => void
}

export default function Exam({ questions, onRetry }: ExamProps) {

  // 🔒 sécurité + limite
  const safeQuestions = Array.from(
    new Map(questions.map(q => [q.id, q])).values()
  ).slice(0, 10)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const currentQuestion = safeQuestions[currentIndex]
  const progress = ((currentIndex + 1) / safeQuestions.length) * 100

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

  // 🎯 RESULT SCREEN
  if (showResult) {
    const total = safeQuestions.length
    const percentage = Math.round((score / total) * 100)

    return (
      <div className="text-center">

        <h2 className="text-3xl font-bold mb-4">
          🎯 Résultat
        </h2>

        <p className="text-xl mb-2">
          {score} / {total}
        </p>

        <p className="text-gray-500 mb-6">
          {percentage}%
        </p>

        <button
          onClick={() => onRetry?.()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
        >
          Recommencer
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg p-6 rounded-2xl w-full max-w-2xl">

      {/* 📊 PROGRESS BAR */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Question {currentIndex + 1} / {safeQuestions.length}
        </p>
      </div>

      {/* ❓ QUESTION */}
      <h2 className="text-lg font-semibold mb-4">
        {currentQuestion.question_text}
      </h2>

      {/* 🖼 IMAGE */}
      {currentQuestion.image_url && (
        <img
          src={currentQuestion.image_url}
          alt="question"
          className="mb-4 max-h-60 mx-auto rounded-lg"
        />
      )}

      {/* 🔘 OPTIONS */}
      <div className="grid gap-3">

        {(["A", "B", "C", "D"] as const).map((key) => {

          const optionText =
            currentQuestion[`option_${key.toLowerCase()}` as keyof Question] as string

          const isCorrect = key === currentQuestion.correct_option
          const isSelected = selected === key

          let style =
            "border p-4 rounded-xl text-left transition-all duration-150"

          if (!selected) {
            style += " hover:bg-gray-100"
          }

          if (selected) {
            if (isCorrect) style += " bg-green-100 border-green-400"
            else if (isSelected) style += " bg-red-100 border-red-400"
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

      {/* 📘 EXPLANATION */}
      {selected && (
        <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded">
          <strong>Explication:</strong> {currentQuestion.explanation}
        </div>
      )}

      {/* ➡️ NEXT */}
      {selected && (
        <button
          onClick={handleNext}
          className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition"
        >
          Suivant
        </button>
      )}

    </div>
  )
}