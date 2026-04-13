"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import Exam from "@/components/Exam"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LearningCategoryPage() {

  const { id } = useParams()
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {

    const load = async () => {

      const { data } = await supabase
        .from("questions")
        .select(`
          id,
          question_translations(*)
        `)
        .eq("category_id", id)

      // flatten
      const formatted = data?.map(q => ({
        ...q.question_translations[0]
      }))

      setQuestions(formatted || [])

    }

    load()

  }, [id])

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-4">
        Practice Category
      </h1>

      <Exam questions={questions} />

    </div>
  )
}