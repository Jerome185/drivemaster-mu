"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useState, useEffect , useMemo } from "react"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translations } from "@/lib/translations"
import { Question } from "@/types/question"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


type ExamProps = {
  questions: Question[]
  onRetry?: () => void
  isMaster?: boolean
}

export default function Exam({
  questions,
  onRetry,
  isMaster = false
}: ExamProps) {

   // 🌍 LANGUE (FIX ICI)
  const { language } = useLanguage()
  const t = translations[language] || translations["en"]

  // 🔐 USER
  const [isPremium, setIsPremium] = useState(false)
  const [premiumStatus, setPremiumStatus] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // 🎮 EXAM
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [examFinished, setExamFinished] = useState(false)

  const timePerQuestion = isMaster ? 30 : 60
  const [timeLeft, setTimeLeft] = useState(timePerQuestion)

  const currentQuestion = questions?.[currentIndex]
  

  // 🧠 MULTI
  const correctOptions = useMemo(() => {
  if (!currentQuestion?.correct_option) return []

  return currentQuestion.correct_option
    .split(",")
    .map((opt) => opt.trim().toUpperCase())
}, [currentQuestion])
  const isMultiple = correctOptions.length > 1

  // 🔀 SHUFFLE DES RÉPONSES (PROPRE)
  const shuffledAnswers = useMemo(() => {
    if (!currentQuestion) return []

    const answers = [
      { key: "A", text: currentQuestion.option_a },
      { key: "B", text: currentQuestion.option_b },
      { key: "C", text: currentQuestion.option_c },
      { key: "D", text: currentQuestion.option_d },
    ]

    return [...answers].sort(() => Math.random() - 0.5)
  }, [currentQuestion])


  // 🔐 PROFILE
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setLoadingProfile(false)
        return
      }

      const { data } = await supabase
        .from("users")
        .select("is_premium, premium_expires_at, premium_status")
        .eq("id", session.user.id)
        .single()

      const isPremiumValid =
        data?.is_premium &&
        data?.premium_status === "active" &&
        (!data?.premium_expires_at ||
          new Date(data.premium_expires_at) > new Date())

      setIsPremium(isPremiumValid)
      setPremiumStatus(data?.premium_status || null)
      setLoadingProfile(false)
    }

    loadProfile()
  }, [])

  // TIMER RESET
  useEffect(() => {
    setTimeLeft(timePerQuestion)
  }, [currentIndex])

  // TIMER
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

  // 🔒 BLOCK MASTER
  if (loadingProfile) {
    return <div className="p-10 text-center">Loading...</div>
  }

  if (isMaster && !isPremium) {
    return (
      <div className="max-w-xl w-full border p-8 rounded shadow bg-white text-center">
        <h2 className="text-xl font-bold mb-4">🔒 Premium required</h2>

        {premiumStatus === "pending" && (
          <p className="text-orange-500">Payment under validation ⏳</p>
        )}

        {premiumStatus === "rejected" && (
          <p className="text-red-500">Payment rejected ❌</p>
        )}

        <button
          onClick={() => window.location.href = "/premium"}
          className="mt-4 bg-blue-900 text-white px-4 py-2 rounded"
        >
          Upgrade
        </button>
      </div>
    )
  }

  if (!questions || !currentQuestion) {
    return <div className="p-10 text-center">No questions available</div>
  }

  // 🧠 VALIDATION
  const validateAnswer = (answers: string[]) => {

    const user = [...answers]
  .map(a => a.trim().toUpperCase())
  .sort()
  .join(",")

const correct = [...correctOptions]
  .map(a => a.trim().toUpperCase())
  .sort()
  .join(",")

    const isCorrect = correct === user

    setShowResult(true)

    if (isCorrect) {
      setScore(prev => prev + (currentQuestion.weight || 0))
    }
  }

  // SELECT
  const handleSelect = (option: string) => {

    if (examFinished || showResult) return

    if (!isMultiple) {
      setSelected([option])
      validateAnswer([option])
    } else {
      setSelected(prev =>
        prev.includes(option)
          ? prev.filter(o => o !== option)
          : [...prev, option]
      )
    }
  }

  // NEXT
  const handleNext = () => {
    setSelected([])
    setShowResult(false)

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setExamFinished(true)
    }
  }

  // RESULT
  if (examFinished) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">{t.examfinished}</h2>
        <p>Score: {score}</p>

       {/* 🔥 AJOUT ICI */}
        <p className="mt-2 text-sm text-gray-500">
          {score >= 8 ? t.success : t.fail}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-900 text-white px-4 py-2 rounded"
        >
          {t.retry}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl w-full border p-6 rounded shadow bg-white">

      {/* HEADER */}
      <div className="flex justify-between text-sm mb-2">
        <span>Question {currentIndex + 1} / {questions.length}</span>
        <span className="text-red-600">{timeLeft}s</span>
      </div>

      {/* QUESTION */}
      <h2 className="text-lg font-semibold mb-4">
        {currentQuestion.question_text}
      </h2>

      {currentQuestion.image_url && (
        <img src={currentQuestion.image_url} className="my-4 w-40 mx-auto"/>
      )}

      {isMultiple && (
        <p className="text-sm text-blue-600 mb-2">
          Select all correct answers
        </p>
      )}

      {/* OPTIONS */}
      <div className="space-y-2">

        {["A","B","C","D"].map(letter => {

          const optionText =
            currentQuestion[`option_${letter.toLowerCase()}` as keyof Question] as string

          const isSelected = selected.includes(letter)
          const isCorrectOption = correctOptions.includes(letter)

          let bg = "hover:bg-gray-100"

          if (showResult) {
            if (isCorrectOption) {
              bg = "bg-green-100 border-green-500"
            } else if (isSelected) {
              bg = "bg-red-100 border-red-500"
            }
          } else if (isSelected) {
            bg = "bg-blue-100 border-blue-500"
          }

          return (
            <button
              key={letter}
              onClick={() => handleSelect(letter)}
              className={`w-full flex items-center gap-3 border p-3 rounded ${bg}`}
            >
              <span className="text-xl">
                {isSelected ? "☑" : "☐"}
              </span>

              <span>
                {letter}. {optionText}
              </span>
            </button>
          )
        })}
      </div>

      {/* VALIDATE MULTI */}
      {isMultiple && !showResult && (
        <button
          onClick={() => validateAnswer(selected)}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded"
        >
          Validate
        </button>
      )}

      {/* RESULT */}
      {showResult && (
        <div className="mt-4">

          <p className={`font-semibold ${
            selected.sort().join(",") === correctOptions.sort().join(",")
              ? "text-green-600"
              : "text-red-600"
          }`}>
            {selected.sort().join(",") === correctOptions.sort().join(",")
              ? "Correct ✅"
              : "Incorrect ❌"}
          </p>

          <p className="text-sm text-gray-600 mt-2">
            {currentQuestion.explanation}
          </p>

          <button
            onClick={handleNext}
            className="mt-4 w-full bg-blue-900 text-white py-2 rounded"
          >
            {t.next}
          </button>
        </div>
      )}

    </div>
  )
}
