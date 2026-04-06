"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SubscriptionPage(){

  const [loading,setLoading] = useState(true)
  const [user,setUser] = useState<any>(null)
  const [profile,setProfile] = useState<any>(null)
  const [payments,setPayments] = useState<any[]>([])

  useEffect(()=>{
    loadData()
  },[])

  const loadData = async()=>{

    const { data:userData } = await supabase.auth.getUser()

    if(!userData.user){
      window.location.href = "/login?redirect=/subscription"
      return
    }

    setUser(userData.user)

    // 👤 Profil
    const { data:profileData } = await supabase
      .from("users")
      .select("*")
      .eq("id",userData.user.id)
      .single()

    setProfile(profileData)

    // 💰 Paiements
    const { data:paymentsData } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id",userData.user.id)
      .order("created_at",{ ascending:false })

    setPayments(paymentsData || [])

    setLoading(false)
  }

  if(loading){
    return <div className="p-10 text-center">Loading...</div>
  }

  return(

    <div className="max-w-3xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-6">
        My Subscription 💎
      </h1>

      {/* STATUS PREMIUM */}
      {profile?.is_premium ? (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-6">
          ✅ Premium Active <br/>
          Expires: {profile.premium_expires_at 
            ? new Date(profile.premium_expires_at).toLocaleDateString()
            : "Lifetime"}
        </div>
      ) : (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-6">
          ❌ You are not Premium
        </div>
      )}

      {/* LISTE PAIEMENTS */}
      <h2 className="text-xl font-bold mb-4">
        Payment History
      </h2>

      {payments.length === 0 && (
        <p>No payments yet</p>
      )}

      {payments.map(p=>(
        <div key={p.id} className="border p-4 mb-3 rounded">

          <p><strong>Transaction:</strong> {p.transaction_id}</p>
          <p><strong>Amount:</strong> Rs {p.amount}</p>
          <p><strong>Status:</strong> 
            {p.status === "pending" && " ⏳ Pending"}
            {p.status === "approved" && " ✅ Approved"}
            {p.status === "declined" && " ❌ Declined"}
          </p>

          {p.status === "declined" && p.decline_reason && (
            <p className="text-red-500">
              Reason: {p.decline_reason}
            </p>
          )}

        </div>
      ))}

    </div>

  )
}