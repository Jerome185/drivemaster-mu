"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useLanguage } from "@/app/context/LanguageContext"
import { useRouter } from "next/navigation"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LearningPage() {

  const { language } = useLanguage()
  const router = useRouter()

  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const loadCategories = async () => {

      // 🔥 ONLY STANDARD QUESTIONS
      const { data, error } = await supabase
        .from("questions")
        .select("category_id, categories(name)")
        .eq("difficulty_level", "standard")
        .not("category_id", "is", null)

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      // 🔥 NO DATA FALLBACK
      if (!data || data.length === 0) {
        setCategories([{ name: "General" }])
        setLoading(false)
        return
      }

      // 🔥 UNIQUE CATEGORIES
      const unique = Object.values(
        data.reduce((acc: any, item: any) => {
          if (item.categories?.name) {
            acc[item.categories.name] = item.categories
          }
          return acc
        }, {})
      )

      setCategories(unique)
      setLoading(false)
    }

    loadCategories()

  }, [])

  const startLearning = () => {
    if (!selectedCategory) return
    router.push(`/learning/session?category=${selectedCategory}`)
  }

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  return (

    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6 text-center">
        Learning Mode 🧠
      </h1>

      <p className="text-center text-gray-600 mb-6">
        Practice easier questions first and build your confidence step by step.
      </p>

      {/* INFO */}
      <p className="text-center text-sm text-gray-400 mb-8">
        {categories.length} categories available
      </p>

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {categories.map((cat: any, index) => {

          const isSelected = selectedCategory === cat.name

          return (

            <div
              key={index}
              onClick={() => setSelectedCategory(cat.name)}
              className={`p-4 border rounded cursor-pointer transition ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <p className="font-semibold">
                {cat.name}
              </p>
            </div>

          )
        })}

      </div>

      {/* ACTION */}
      <div className="text-center">

        <button
          onClick={startLearning}
          disabled={!selectedCategory}
          className={`px-6 py-3 rounded text-white ${
            selectedCategory
              ? "bg-blue-700 hover:bg-blue-800"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Start Learning 🚀
        </button>

      </div>

      {/* BONUS INFO */}
      <div className="mt-10 text-center text-sm text-gray-500">
        💡 Tip: Master easy questions first before trying the exam mode
      </div>

    </div>

  )
}