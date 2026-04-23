"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* HERO */}
      <section className="px-6 py-12 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          Réussis ton permis à Maurice du premier coup 🚗
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Entraîne-toi avec des questions type examen + explications claires
        </p>

        <div className="mt-6 space-y-2 text-sm text-gray-500">
          <p>✅ Français & Anglais</p>
          <p>✅ Questions réalistes</p>
          <p>✅ Mobile friendly</p>
        </div>

        <button
          onClick={() => router.push("/exam")}
          className="mt-8 bg-black text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-gray-800 transition"
        >
          Commencer maintenant
        </button>

        <p className="mt-3 text-sm text-red-500 font-medium">
          🔥 Offre lancement : Rs 999 (places limitées)
        </p>
      </section>

      {/* PROBLEM */}
      <section className="bg-gray-50 py-12 px-6 text-center">
        <h2 className="text-2xl font-semibold">
          Pourquoi beaucoup échouent ?
        </h2>

        <div className="mt-6 space-y-3 text-gray-600">
          <p>❌ Questions piégeuses</p>
          <p>❌ Réponses ambiguës</p>
          <p>❌ Pas assez d’entraînement réel</p>
        </div>

        <p className="mt-6 font-medium text-gray-800">
          👉 Ce n’est pas un problème de conduite.
        </p>
      </section>

      {/* SOLUTION */}
      <section className="py-12 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold">
          La solution : DriveMaster MU
        </h2>

        <div className="mt-6 grid md:grid-cols-3 gap-6 text-sm">
          <div className="p-4 border rounded-xl">
            <p className="font-semibold">🎯 Questions type examen</p>
            <p className="text-gray-500 mt-2">
              Inspirées des vrais tests
            </p>
          </div>

          <div className="p-4 border rounded-xl">
            <p className="font-semibold">🧠 Explications simples</p>
            <p className="text-gray-500 mt-2">
              Comprends tes erreurs
            </p>
          </div>

          <div className="p-4 border rounded-xl">
            <p className="font-semibold">📱 Mobile friendly</p>
            <p className="text-gray-500 mt-2">
              Révise partout
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center bg-black text-white">
        <h2 className="text-2xl font-semibold">
          Prêt à réussir ton permis ?
        </h2>

        <button
          onClick={() => router.push("/exam")}
          className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
        >
          Accéder aux examens
        </button>

        <p className="mt-4 text-sm text-gray-300">
          Accès immédiat après inscription
        </p>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} DriveMaster MU
      </footer>

    </main>
  )
}