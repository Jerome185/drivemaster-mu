"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { getTranslator } from "@/lib/i18n"

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
  const t = getTranslator(language)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    if (!language) return

    const fetchCategories = async () => {

      setLoading(true)

      const { data, error } = await supabase
        .from("questions")
        .select(`
          categories (id, name),
          question_translations!inner (language_code)
        `)
        .eq("question_translations.language_code", language.toUpperCase())
        .eq("is_active", true)

      if (!error && data) {
        const map = new Map<string, Category>()

        data.forEach((item: any) => {
          const cat = item.categories
          if (cat && !map.has(cat.id)) {
            map.set(cat.id, cat)
          }
        })

        setCategories(Array.from(map.values()))
      }

      setLoading(false)
    }

    fetchCategories()

  }, [language])

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="p-10 text-center">
        {t("loading")}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* 🧠 TITLE */}
      <h1 className="text-4xl font-bold text-center mb-2">
        {language === "fr" ? "Mode Apprentissage 🧠" : "Learning Mode 🧠"}
      </h1>

      <p className="text-gray-500 text-center mb-6">
        {language === "fr"
          ? "Choisis une catégorie pour commencer"
          : "Choose a category to start"}
      </p>

      {/* 📦 CATEGORIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              router.push(`/learning/${cat.id}`)
            }
            className="group border rounded-2xl p-5 bg-white shadow-sm hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="flex items-center justify-between">

              {/* LEFT */}
              <div>
                <p className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
                  {cat.name}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {language === "fr"
                    ? "S'entraîner sur cette catégorie"
                    : "Practice this category"}
                </p>
              </div>

              {/* RIGHT ICON */}
              <div className="text-2xl">
                🚗
              </div>

            </div>
          </button>
        ))}

      </div>

      {/* ⚠️ EMPTY */}
      {categories.length === 0 && (
        <div className="text-center mt-10 text-gray-500">
          {t("noQuestions")}
        </div>
      )}

    </div>
  )
}