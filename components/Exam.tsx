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
  image_url?: string | null
}

type ExamProps = {
  questions: Question[]
  isMaster?: boolean
  onRetry?: () => void
}

export default function Exam({ questions, isMaster, onRetry }: ExamProps) {

  // 🔥 SAFE: max 10 questions + no duplicates
  const safeQuestions = Array.from(
    new Map(questions.map(q => [q.id, q])).values()
  ).slice(0, 10)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const currentQuestion = safeQuestions[currentIndex]

  const handleAnswer = (option: string) => {
    if (selected) return

    setSelected(option)

    const isCorrect = option === currentQuestion.correct_option

    // ✅ 1 point seulement
    if (isCorrect) {
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

  // 🎯 RESULT
  if (showResult) {
    const total = safeQuestions.length
    const percentage = Math.round((score / total) * 100)

    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          {isMaster ? 'Master Result 🔥' : 'Résultat'}
        </h2>

        <p className="text-lg mb-2">
          Score: {score} / {total}
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
    <div className="bg-white shadow p-6 rounded-lg max-w-2xl mx-auto">

      {/* Progress */}
      <p className="text-sm text-gray-500 mb-2">
        Question {currentIndex + 1} / {safeQuestions.length}
      </p>

      {/* Question */}
      <h2 className="text-lg font-semibold mb-4">
        {currentQuestion.question_text}
      </h2>

      {/* Image */}
      {currentQuestion.image_url && (
        <img
          src={currentQuestion.image_url}
          alt="question"
          className="mb-4 max-h-60 mx-auto"
        />
      )}

      {/* Options */}
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

      {/* Explanation */}
      {selected && (
        <div className="mt-4 text-sm text-gray-700">
          <strong>Explication:</strong> {currentQuestion.explanation}
        </div>
      )}

      {/* Next */}
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