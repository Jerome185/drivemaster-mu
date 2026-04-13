"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { useLanguage } from "../contexts/LanguageContext"

type Category = {
  id: string
  name: string
}

export default function LearningPage() {

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { language } = useLanguage()
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    if (!language) return

    const fetchCategories = async () => {

      setLoading(true)

      const lang = language.toLowerCase() // 🔥 FIX ICI

      const { data, error } = await supabase
        .from("questions")
        .select(`
          categories (id, name),
          question_translations!inner (language_code)
        `)
        .eq("question_translations.language_code", lang)
        .eq("is_active", true)

      if (error) {
        console.error("Error fetching categories:", error)
      } else {

        const uniqueMap = new Map<string, Category>()

        data?.forEach((item: any) => {
          const cat = item.categories

          if (cat && !uniqueMap.has(cat.id)) {
            uniqueMap.set(cat.id, cat)
          }
        })

        setCategories(Array.from(uniqueMap.values()))
      }

      setLoading(false)
    }

    fetchCategories()

  }, [language])

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-center">

      <h1 className="text-3xl font-bold mb-4">
        {language === "fr" ? "Mode Apprentissage 🧠" : "Learning Mode 🧠"}
      </h1>

      <p className="text-gray-500 mb-6">
        {categories.length}{" "}
        {language === "fr"
          ? "catégories disponibles"
          : "categories available"}
      </p>

      <div className="grid grid-cols-2 gap-4">

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => router.push(`/learning/${cat.id}`)} // 🔥 FIX ROUTE
            className="border p-4 rounded-lg hover:bg-gray-100 transition"
          >
            {cat.name}
          </button>
        ))}

      </div>

    </div>
  )
}