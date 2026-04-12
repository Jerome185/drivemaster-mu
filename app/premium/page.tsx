"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PremiumPage() {

  const [plan, setPlan] = useState<"free" | "official" | "master" | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const loadProfile = async () => {

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("users")
        .select("plan")
        .eq("id", session.user.id)
        .single()

      setPlan(data?.plan || "free")
      setLoading(false)
    }

    loadProfile()

  }, [])

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  return (
    <div className="max-w-5xl mx-auto p-8">

      {/* HEADER */}
      <h1 className="text-4xl font-bold text-center mb-4">
        Upgrade Your Driving Skills 🚗
      </h1>

      <p className="text-center text-gray-600 mb-10">
        Pass your driving test faster with DriveMaster
      </p>

      {/* PLANS */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* ===================== */}
        {/* OFFICIAL PLAN */}
        {/* ===================== */}
        <div className="border rounded-xl p-6 shadow">

          <h2 className="text-2xl font-bold mb-2">Official</h2>
          <p className="text-gray-500 mb-4">Perfect for beginners</p>

          <p className="text-3xl font-bold mb-4">Rs 999</p>

          <ul className="space-y-2 mb-6">
            <li>✅ Unlimited Official questions</li>
            <li>✅ Practice anytime</li>
            <li>✅ Improve your basics</li>
            <li>❌ Master mode</li>
          </ul>

          {plan === "official" || plan === "master" ? (
            <button className="w-full bg-gray-300 py-2 rounded cursor-not-allowed">
              Current Plan
            </button>
          ) : (
            <button
              className="w-full bg-blue-900 text-white py-2 rounded"
              onClick={() => alert("TODO: payment official")}
            >
              Upgrade to Official
            </button>
          )}

        </div>

        {/* ===================== */}
        {/* MASTER PLAN */}
        {/* ===================== */}
        <div className="border-2 border-red-600 rounded-xl p-6 shadow-lg">

          <h2 className="text-2xl font-bold mb-2 text-red-600">
            Master 🔥
          </h2>

          <p className="text-gray-500 mb-4">
            Pass your exam with confidence
          </p>

          <p className="text-3xl font-bold mb-4">Rs 1499</p>

          <ul className="space-y-2 mb-6">
            <li>✅ Everything in Official</li>
            <li>✅ Master exam questions</li>
            <li>✅ Trick & difficult questions</li>
            <li>✅ Real exam simulation</li>
          </ul>

          {plan === "master" ? (
            <button className="w-full bg-gray-300 py-2 rounded cursor-not-allowed">
              Current Plan
            </button>
          ) : (
            <button
              className="w-full bg-red-600 text-white py-2 rounded"
              onClick={() => alert("TODO: payment master")}
            >
              Upgrade to Master 🚀
            </button>
          )}

        </div>

      </div>

      {/* FOOTER CTA */}
      <div className="text-center mt-10">
        <p className="text-gray-500">
          1000+ students already improving their driving skills
        </p>
      </div>

    </div>
  )
}