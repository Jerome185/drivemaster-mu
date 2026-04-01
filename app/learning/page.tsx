"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { useLanguage } from "../contexts/LanguageContext"

type Category = {
  id: number
  name: string
}

export default function LearningPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const router = useRouter()
  const { language } = useLanguage()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // 🔥 NORMALISATION (clé du problème)
  const normalizeCategory = (name: string) => {
    const map: Record<string, string> = {
      "Motorway": "Autoroute",
      "Road Signs": "Signalisation",
      "Round About": "Ronds-points",
      "Roundabout": "Ronds-points",
      "Road Safety": "Sécurité routière",
      "Parking": "Stationnement",
      "Right of Way": "Priorités",
      "Traffic Rules": "Infractions & règles générales",
    }

    return map[name] || name
  }

  // 🔥 TRADUCTION UI
  const translateCategory = (name: string) => {
    const map: Record<string, string> = {
      "Signalisation": "Road Signs",
      "Stationnement": "Parking",
      "Sécurité routière": "Road Safety",
      "Ronds-points": "Roundabout",
      "Autoroute": "Motorway",
      "Priorités": "Right of Way",
      "Infractions & règles générales": "Traffic Rules",
    }

    return language === "fr" ? name : map[name] || name
  }

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name")

      if (error) {
        console.error("Error fetching categories:", error)
      } else {
        // ✅ 1. normaliser
        const normalized = (data || []).map((cat) => ({
          ...cat,
          name: normalizeCategory(cat.name),
        }))

        // ✅ 2. supprimer doublons
        const unique = Array.from(
          new Map(normalized.map((c) => [c.name, c])).values()
        )

        setCategories(unique)
      }

      setLoading(false)
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-2">
        {language === "fr" ? "Mode Apprentissage 🧠" : "Learning Mode 🧠"}
      </h1>

      <p className="text-gray-600 mb-6">
        {language === "fr"
          ? "Entraînez-vous progressivement et améliorez votre confiance."
          : "Practice step by step and build your confidence."}
      </p>

      <p className="text-sm text-gray-400 mb-6">
        {categories.length}{" "}
        {language === "fr"
          ? "catégories disponibles"
          : "categories available"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() =>
              router.push(`/learning/session/${cat.id}`)
            }
            className="border p-4 rounded-lg hover:bg-gray-100 transition"
          >
            {translateCategory(cat.name)}
          </button>
        ))}
      </div>
    </div>
  )
}