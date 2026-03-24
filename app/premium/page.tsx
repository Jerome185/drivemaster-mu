"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useState } from "react"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PremiumPage() {

  const [txId, setTxId] = useState("")
  const [plan, setPlan] = useState("monthly")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const prices: Record<string, number> = {
    monthly: 200,
    quarterly: 500,
    lifetime: 2000
  }

  const submitPayment = async () => {

    if (!txId || txId.length < 6) {
      setMessage("Enter a valid transaction ID")
      return
    }

    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
      setMessage("You must be logged in")
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from("payments")
      .insert({
        user_id: userData.user.id,
        amount: prices[plan],
        payment_method: "Juice",
        transaction_id: txId,
        plan: plan,
        status: "pending"
      })

    if (error) {
      console.error(error)
      setMessage("Error submitting payment")
    } else {
      setMessage("Payment submitted. Verification within 24h.")
      setTxId("")
    }

    setLoading(false)
  }

  return (

    <div className="max-w-xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-6 text-center">
        DriveMaster Premium 🚀
      </h1>

      <div className="border p-6 rounded">

        {/* PLAN SELECTION */}
        <label className="block mb-2 font-semibold">
          Select Plan:
        </label>

        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="border p-2 w-full mb-4"
        >
          <option value="monthly">1 Month — Rs 200</option>
          <option value="quarterly">3 Months — Rs 500</option>
          <option value="lifetime">Lifetime — Rs 2000</option>
        </select>

        <p className="mb-4 text-lg">
          Price: <b>Rs {prices[plan]}</b>
        </p>

        {/* PAYMENT INFO */}
        <div className="bg-gray-100 p-4 rounded mb-4">
          <p>Pay using Juice:</p>
          <p className="font-bold text-xl">
            5771 8436
          </p>
        </div>

        {/* TRANSACTION INPUT */}
        <p className="mb-2">
          Enter your Juice Transaction ID:
        </p>

        <input
          value={txId}
          onChange={(e) => setTxId(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        {/* BUTTON */}
        <button
          onClick={submitPayment}
          disabled={loading}
          className="bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Submitting..." : "Submit Payment"}
        </button>

        {/* MESSAGE */}
        {message && (
          <p className="mt-4 text-green-600 text-center">
            {message}
          </p>
        )}

      </div>

    </div>
  )
}