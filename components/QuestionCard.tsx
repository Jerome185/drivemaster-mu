"use client"

import { useState } from "react"

type Question = {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string
}

export default function QuestionCard({ question }: { question: Question }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSelect = (option: string) => {
    setSelected(option)
    setShowResult(true)
  }

  const isCorrect = selected === question.correct_option

  return (
    <div className="max-w-xl w-full border p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">
        {question.question_text}
      </h2>

      <div className="space-y-2">
        {["A", "B", "C", "D"].map((letter) => {
          const optionText = question[`option_${letter.toLowerCase()}` as keyof Question] as string

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
          {isCorrect ? (
            <p className="text-green-600 font-semibold">Correct ✅</p>
          ) : (
            <p className="text-red-600 font-semibold">
              Incorrect ❌ — Correct answer: {question.correct_option}
            </p>
          )}

          <p className="mt-2 text-sm text-gray-600">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  )
}