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

      if (!error) {
        const map = new Map<string, Category>()

        data?.forEach((item: any) => {
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

  if (loading) {
    return <p className="text-center mt-10">{t("loading")}</p>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-center">

      <h1 className="text-3xl font-bold mb-4">
        {language === "fr" ? "Mode Apprentissage 🧠" : "Learning Mode 🧠"}
      </h1>

      <div className="grid grid-cols-2 gap-4">

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              router.push(`/learning/${cat.id}?lang=${language}`)
            }
            className="border p-4 rounded-lg hover:bg-gray-100"
          >
            {cat.name}
          </button>
        ))}

      </div>

    </div>
  )
}