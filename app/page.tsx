"use client"

import { useRouter } from "next/navigation"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translations } from "@/lib/translations"

export default function Home() {

  const router = useRouter()
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* HERO */}
      <section className="px-6 py-12 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          {t.title} 🚗
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          {t.subtitle}
        </p>

        <div className="mt-6 space-y-2 text-sm text-gray-500">
          <p>✅ {t.feature1}</p>
          <p>✅ {t.feature2}</p>
          <p>✅ {t.feature3}</p>
        </div>

        <button
          onClick={() => router.push("/premium")}
          className="mt-8 bg-black text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-gray-800 transition"
        >
          {t.start}
        </button>

        <p className="mt-3 text-sm text-red-500 font-medium">
          {t.offer}
        </p>
      </section>

      {/* PROBLEM */}
      <section className="bg-gray-50 py-12 px-6 text-center">
        <h2 className="text-2xl font-semibold">
          {t.problemTitle}
        </h2>

        <div className="mt-6 space-y-3 text-gray-600">
          <p>❌ {t.problem1}</p>
          <p>❌ {t.problem2}</p>
          <p>❌ {t.problem3}</p>
        </div>

        <p className="mt-6 font-medium text-gray-800">
          👉 {t.problemConclusion}
        </p>
      </section>

      {/* SOLUTION */}
      <section className="py-12 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold">
          {t.solutionTitle}
        </h2>

        <div className="mt-6 grid md:grid-cols-3 gap-6 text-sm">
          <div className="p-4 border rounded-xl">
            <p className="font-semibold">🎯 {t.sol1Title}</p>
            <p className="text-gray-500 mt-2">
              {t.sol1Desc}
            </p>
          </div>

          <div className="p-4 border rounded-xl">
            <p className="font-semibold">🧠 {t.sol2Title}</p>
            <p className="text-gray-500 mt-2">
              {t.sol2Desc}
            </p>
          </div>

          <div className="p-4 border rounded-xl">
            <p className="font-semibold">📱 {t.sol3Title}</p>
            <p className="text-gray-500 mt-2">
              {t.sol3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center bg-black text-white">
        <h2 className="text-2xl font-semibold">
          {t.ctaTitle}
        </h2>

        <button
          onClick={() => router.push("/premium")}
          className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
        >
          {t.ctaButton}
        </button>

        <p className="mt-4 text-sm text-gray-300">
          {t.ctaSub}
        </p>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} DriveMaster MU
      </footer>

    </main>
  )
}