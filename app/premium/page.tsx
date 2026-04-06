"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PremiumPage(){

  const router = useRouter()

  const [user,setUser] = useState<any>(null)
  const [loading,setLoading] = useState(true)

  const [selectedPlan,setSelectedPlan] = useState("lifetime")
  const [transactionId,setTransactionId] = useState("")
  const [submitting,setSubmitting] = useState(false)

  useEffect(()=>{

    const checkUser = async () => {

      const { data } = await supabase.auth.getUser()

      if(!data.user){
        router.push("/login?redirect=/premium")
        return
      }

      setUser(data.user)
      setLoading(false)
    }

    checkUser()

  },[])

  // 💰 PRIX PAR PLAN
  const getPrice = () => {
    if(selectedPlan === "1_month") return 500
    if(selectedPlan === "3_months") return 1200
    return 999 // lifetime
  }

  // 🚀 SUBMIT PAYMENT
  const submitPayment = async () => {

    if(!transactionId){
      alert("Please enter transaction ID")
      return
    }

    setSubmitting(true)

    await supabase.from("payments").insert({
  user_id: user.id,
  transaction_id: transactionId,
  amount: getPrice(),
  plan: selectedPlan,
  payment_method: "Juice", // ✅ AJOUT ICI
  status: "pending"
})

    alert("✅ Payment submitted! Waiting for validation.")

    router.push("/subscription")
  }

  if(loading){
    return <div className="p-10 text-center">Loading...</div>
  }

  return(

    <div className="max-w-xl mx-auto p-10 text-center">

      <h1 className="text-3xl font-bold mb-6">
        Upgrade to Premium 🚀
      </h1>

      {/* PLANS */}
      <div className="space-y-4 mb-6">

        <div
          onClick={()=>setSelectedPlan("1_month")}
          className={`border p-4 cursor-pointer rounded ${
            selectedPlan === "1_month" ? "bg-blue-100" : ""
          }`}
        >
          <h2>1 Month</h2>
          <p>Rs 500</p>
        </div>

        <div
          onClick={()=>setSelectedPlan("3_months")}
          className={`border p-4 cursor-pointer rounded ${
            selectedPlan === "3_months" ? "bg-blue-100" : ""
          }`}
        >
          <h2>3 Months</h2>
          <p>Rs 1200</p>
        </div>

        <div
          onClick={()=>setSelectedPlan("lifetime")}
          className={`border p-4 cursor-pointer rounded ${
            selectedPlan === "lifetime" ? "bg-blue-100" : ""
          }`}
        >
          <h2>Lifetime 🔥</h2>
          <p>Rs 999</p>
        </div>

      </div>

      {/* PAIEMENT INFO */}
      <div className="bg-gray-100 p-4 mb-6 rounded">
        <p className="mb-2">Pay via Juice:</p>
        <strong className="text-lg">5771 8436</strong>
      </div>

      {/* INPUT TX */}
      <input
        type="text"
        placeholder="Enter Transaction ID"
        value={transactionId}
        onChange={(e)=>setTransactionId(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />

      {/* BOUTON */}
      <button
        onClick={submitPayment}
        disabled={submitting}
        className="w-full bg-green-600 text-white p-3 rounded"
      >
        {submitting ? "Submitting..." : "Submit Payment"}
      </button>

    </div>

  )
}