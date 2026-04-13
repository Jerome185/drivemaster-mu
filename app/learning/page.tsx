"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LearningPage() {

  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {

    const load = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")

      setCategories(data || [])
    }

    load()

  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Learning Mode 📚
      </h1>

      <div className="grid md:grid-cols-2 gap-4">

        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/learning/${cat.id}`}
            className="border p-4 rounded hover:bg-gray-50"
          >
            <h2 className="text-lg font-semibold">
              {cat.name}
            </h2>
          </Link>
        ))}

      </div>

    </div>
  )
}