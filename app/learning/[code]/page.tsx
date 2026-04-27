'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Exam from '@/components/Exam'
import { useParams } from 'next/navigation'


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

export default function LearningCategoryPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const supabase = createClient()
  const searchParams = useSearchParams()

  const { code } = useParams() as { code: string }
  const lang = (searchParams.get('lang') || 'FR').toUpperCase()

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [code, lang])

  const fetchQuestions = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.rpc(
      'get_learning_questions',
      {
        lang: lang,
        category_code: code,
      }
    )
    console.log('QUESTIONS LENGTH:', questions.length)

    if (error) {
      console.error('RPC ERROR:', error)
      setError('Erreur chargement questions')
    } else {
      setQuestions((data || []).slice(0, 10))
    }
    
    console.log('STATE QUESTIONS LENGTH:', (data || []).length)

    setLoading(false)
  }

  // 🔄 Retry handler
  const handleRetry = () => {
    fetchQuestions()
  }

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement...</p>
      </div>
    )
  }

  // ❌ Error
  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    )
  }

  // ⚠️ No questions
  if (!questions.length) {
  return (
    <div className="p-10 text-center">
      {lang === "FR"
        ? "Aucune question disponible"
        : "No questions available"}
    </div>
  )
}

  // 🎯 Main
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Exam
        questions={questions}
        onRetry={handleRetry}
      />
    </div>
  )
}

