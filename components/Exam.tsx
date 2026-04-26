'use client'

import { useState } from 'react'

type Question = {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string
  weight?: number
}

type ExamProps = {
  questions: Question[]
  isMaster?: boolean
  onRetry?: () => void
}

export default function Exam({ questions, isMaster, onRetry }: ExamProps) {

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const currentQuestion = questions[currentIndex]

  // 🔥 Normalisation (corrige ton bug de comparaison)
  const normalize = (val: string) => val.trim().toUpperCase()

  const handleAnswer = (option: string) => {
    if (selected) return

    setSelected(option)

    const isCorrect =
      normalize(option) === normalize(currentQuestion.correct_option)

    const weight = currentQuestion.weight ?? 1

    if (isCorrect) {
      setScore(prev => prev + weight)
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1)
      setSelected(null)
    } else {
      setShowResult(true)
    }
  }

  // 🎯 RESULT SCREEN
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100)

    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Résultat</h2>

        <p className="text-lg mb-2">
          Score: {score} / {questions.length}
        </p>

        <p className="text-gray-600 mb-4">
          {percentage}%
        </p>

        <button
          onClick={() => onRetry?.()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Recommencer
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow p-6 rounded-lg">

      {/* 🧠 Progress */}
      <p className="text-sm text-gray-500 mb-2">
        Question {currentIndex + 1} / {questions.length}
      </p>

      {/* ❓ Question */}
      <h2 className="text-lg font-semibold mb-4">
        {currentQuestion.question_text}
      </h2>

      {/* 🔘 Options */}
      <div className="grid gap-3">
        {(['A', 'B', 'C', 'D'] as const).map((key) => {
          const optionText =
            currentQuestion[`option_${key.toLowerCase()}` as keyof Question] as string

          const isCorrect =
            normalize(key) === normalize(currentQuestion.correct_option)

          const isSelected = selected === key

          let style = "border p-3 rounded cursor-pointer"

          if (selected) {
            if (isCorrect) style += " bg-green-200"
            else if (isSelected) style += " bg-red-200"
          }

          return (
            <button
              key={key}
              onClick={() => handleAnswer(key)}
              className={style}
            >
              {optionText}
            </button>
          )
        })}
      </div>

      {/* 📘 Explanation */}
      {selected && (
        <div className="mt-4 text-sm text-gray-700">
          <strong>Explication:</strong> {currentQuestion.explanation}
        </div>
      )}

      {/* ➡️ Next */}
      {selected && (
        <button
          onClick={handleNext}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Suivant
        </button>
      )}

    </div>
  )
}