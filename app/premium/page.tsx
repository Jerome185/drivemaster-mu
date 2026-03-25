"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PremiumPage(){

  const [txId,setTxId] = useState("")
  const [plan,setPlan] = useState("lifetime")
  const [message,setMessage] = useState("")
  const [loading,setLoading] = useState(false)

  const prices:any = {
    "1m": 500,
    "3m": 1200,
    "lifetime": 2000
  }

  const submitPayment = async()=>{

    setLoading(true)

    const { data:userData } = await supabase.auth.getUser()

    if(!userData.user){
      setMessage("Please login first")
      setLoading(false)
      return
    }

    if(!txId){
      setMessage("Enter transaction ID")
      setLoading(false)
      return
    }

    const user = userData.user

    // 💰 INSERT PAYMENT
    await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        amount: prices[plan],
        plan,
        payment_method: "Juice",
        transaction_id: txId,
        status: "pending"
      })

    // 🔥 TEMP PREMIUM (24h)
    await supabase
      .from("users")
      .update({
        is_premium: true,
        premium_expires_at: new Date(Date.now() + 24*60*60*1000)
      })
      .eq("id", user.id)

    setMessage("✅ Premium unlocked for 24h. Awaiting validation.")
    setLoading(false)
  }

  return(

    <div className="max-w-xl mx-auto p-8">

      <h1 className="text-3xl font-bold text-center mb-6">
        Upgrade to Premium 🚀
      </h1>

      {/* PLANS */}
      <div className="space-y-4 mb-8">

        {[
          { id:"1m", label:"1 Month", price:"Rs 500" },
          { id:"3m", label:"3 Months", price:"Rs 1200" },
          { id:"lifetime", label:"Lifetime 🔥", price:"Rs 2000" }
        ].map(p=>{

          const active = plan === p.id

          return(
            <div
              key={p.id}
              onClick={()=>setPlan(p.id)}
              className={`p-4 border rounded cursor-pointer ${
                active ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              <p className="font-semibold">{p.label}</p>
              <p>{p.price}</p>
            </div>
          )
        })}

      </div>

      {/* PAYMENT */}
      <div className="bg-gray-100 p-4 rounded mb-6 text-center">
        <p>Pay via Juice:</p>
        <p className="text-xl font-bold">5771 8436</p>
      </div>

      <input
        placeholder="Transaction ID"
        value={txId}
        onChange={(e)=>setTxId(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={submitPayment}
        disabled={loading}
        className="bg-green-600 text-white w-full py-3 rounded"
      >
        {loading ? "Processing..." : "Submit Payment"}
      </button>

      {message && (
        <p className="mt-4 text-center text-green-600">
          {message}
        </p>
      )}

    </div>
  )
}