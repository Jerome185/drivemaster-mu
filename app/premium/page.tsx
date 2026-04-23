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

  const [showPayment, setShowPayment] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"official" | "master" | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [submitting, setSubmitting] = useState(false)

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

  const handlePayment = async () => {

    if (!transactionId) {
      alert("Veuillez entrer le Transaction ID")
      return
    }

    setSubmitting(true)

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      alert("Not logged in")
      setSubmitting(false)
      return
    }

    try {

      // 1. Insert payment
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: session.user.id,
          transaction_id: transactionId,
          plan: selectedPlan,
          status: "pending"
        })

      if (paymentError) throw paymentError

      // 2. Update user (pending)
      const { error: userError } = await supabase
        .from("users")
        .update({
          premium_status: "pending",
          plan: selectedPlan
        })
        .eq("id", session.user.id)

      if (userError) throw userError

      alert("Paiement soumis ✅ En attente de validation")

      setShowPayment(false)
      setTransactionId("")

    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'envoi du paiement")
    }

    setSubmitting(false)
  }

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  return (
    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-4xl font-bold text-center mb-4">
        Upgrade Your Driving Skills 🚗
      </h1>

      <p className="text-center text-gray-600 mb-10">
        Pass your driving test faster with DriveMaster
      </p>

      <div className="grid md:grid-cols-2 gap-6">

        {/* OFFICIAL */}
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
              onClick={() => {
                setSelectedPlan("official")
                setShowPayment(true)
              }}
            >
              Upgrade to Official
            </button>
          )}

        </div>

        {/* MASTER */}
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
              onClick={() => {
                setSelectedPlan("master")
                setShowPayment(true)
              }}
            >
              Upgrade to Master 🚀
            </button>
          )}

        </div>

      </div>

      {/* PAYMENT MODAL */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              Paiement Juice 💳
            </h2>

            <p className="mb-2">Envoyez le paiement à :</p>
            <p className="font-bold text-lg mb-4">5771 8436</p>

            <p className="text-sm text-gray-600 mb-4">
              Montant : {selectedPlan === "official" ? "Rs 999" : "Rs 1499"}
            </p>

            <input
              type="text"
              placeholder="Transaction ID"
              className="w-full border p-2 rounded mb-4"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />

            <button
              disabled={submitting}
              className="w-full bg-green-600 text-white py-2 rounded mb-2"
              onClick={handlePayment}
            >
              {submitting ? "Envoi..." : "J’ai payé"}
            </button>

            <button
              className="w-full text-gray-500"
              onClick={() => setShowPayment(false)}
            >
              Annuler
            </button>

          </div>

        </div>
      )}

      <div className="text-center mt-10">
        <p className="text-gray-500">
          1000+ students already improving their driving skills
        </p>
      </div>

    </div>
  )
}