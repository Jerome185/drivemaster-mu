"use client"

import { useEffect,useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPage(){

  const [payments,setPayments] = useState<any[]>([])

  useEffect(()=>{
    loadPayments()
  },[])

  const loadPayments = async()=>{

    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("status","pending")

    setPayments(data || [])
  }

  const approve = async(p:any)=>{

    await supabase
      .from("payments")
      .update({ status:"approved" })
      .eq("id",p.id)

    await supabase
      .from("users")
      .update({
        is_premium:true,
        premium_expires_at:null
      })
      .eq("id",p.user_id)

    loadPayments()
  }

  return(

    <div className="max-w-3xl mx-auto p-8">

      <h1 className="text-2xl font-bold mb-6">
        Admin Panel
      </h1>

      {payments.length === 0 && (
        <p>No pending payments</p>
      )}

      {payments.map(p=>(

        <div key={p.id} className="border p-4 mb-4 rounded">

          <p>User: {p.user_id}</p>
          <p>Plan: {p.plan}</p>
          <p>Amount: Rs {p.amount}</p>
          <p>TX: {p.transaction_id}</p>

          <button
            onClick={()=>approve(p)}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
          >
            Approve
          </button>

        </div>

      ))}

    </div>
  )
}