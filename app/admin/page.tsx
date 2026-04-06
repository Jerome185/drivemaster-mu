"use client"

import { useEffect,useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPage(){

  const [payments,setPayments] = useState<any[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    checkAdminAndLoad()
  },[])

  // 🔐 CHECK ADMIN + LOAD
  const checkAdminAndLoad = async()=>{

    const { data:userData } = await supabase.auth.getUser()

    if(!userData.user){
      window.location.href = "/login"
      return
    }

    const { data:profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id",userData.user.id)
      .single()

    if(!profile?.is_admin){
      alert("Access denied")
      window.location.href = "/"
      return
    }

    loadPayments()
  }

  // 📦 LOAD PAYMENTS
  const loadPayments = async()=>{

  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      users(email)
    `)
    .eq("status","pending")
    .order("created_at",{ ascending:false })

  console.log("DATA:", data)
  console.log("ERROR:", error)

  setPayments(data || [])
  setLoading(false)
}

  // ✅ APPROVE
  const approve = async(p:any)=>{

    await supabase
      .from("payments")
      .update({ status:"approved" })
      .eq("id",p.id)

    let duration = 30

    if(p.plan === "3_months") duration = 90
    if(p.plan === "lifetime") duration = 9999

    await supabase
      .from("users")
      .update({
        is_premium:true,
        premium_expires_at: new Date(
          Date.now() + duration*24*60*60*1000
        )
      })
      .eq("id",p.user_id)

    loadPayments()
  }

  // ❌ DECLINE
  const decline = async(p:any)=>{

    const reason = prompt("Reason for decline?")
    if(!reason) return

    await supabase
      .from("payments")
      .update({
        status:"declined",
        decline_reason:reason
      })
      .eq("id",p.id)

    loadPayments()
  }

  if(loading){
    return <div className="p-10 text-center">Loading...</div>
  }

  return(

    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-2xl font-bold mb-6">
        Admin Panel 💰
      </h1>

      {payments.length === 0 && (
        <p>No pending payments</p>
      )}

      {payments.map(p=>(

        <div key={p.id} className="border p-4 mb-4 rounded">

          <p><strong>Email:</strong> {p.users?.email}</p>
          <p><strong>Plan:</strong> {p.plan}</p>
          <p><strong>Amount:</strong> Rs {p.amount}</p>
          <p><strong>TX:</strong> {p.transaction_id}</p>

          <div className="flex gap-3 mt-4">

            <button
              onClick={()=>approve(p)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Approve
            </button>

            <button
              onClick={()=>decline(p)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Decline
            </button>

          </div>

        </div>

      ))}

    </div>
  )
}