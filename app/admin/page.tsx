"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPage() {

  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const init = async () => {

      // 🔐 1. CHECK SESSION
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const userId = session.user.id

      // 👤 2. CHECK ADMIN ROLE
      const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", userId)
        .single()

      if (!profile?.is_admin) {
        router.push("/")
        return
      }

      // 💰 3. LOAD PAYMENTS
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      setPayments(data || [])
      setLoading(false)
    }

    init()

  }, [router])

  const approvePayment = async (payment: any) => {

    // ✅ UPDATE PAYMENT STATUS
    await supabase
      .from("payments")
      .update({ status: "approved" })
      .eq("id", payment.id)

    let updateData: any = {}

    // 🎯 PLAN LOGIC
    if (payment.plan === "monthly") {
      updateData.premium_until =
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }

    if (payment.plan === "quarterly") {
      updateData.premium_until =
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    }

    if (payment.plan === "lifetime") {
      updateData.is_premium = true
      updateData.premium_until = null
    }

    // 👤 UPDATE USER
    await supabase
      .from("users")
      .update(updateData)
      .eq("id", payment.user_id)

    // 🔄 REFRESH
    setPayments(prev => prev.filter(p => p.id !== payment.id))
  }

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Admin Panel 🔐
      </h1>

      {payments.length === 0 && (
        <p>No pending payments</p>
      )}

      <div className="space-y-4">

        {payments.map((p) => (

          <div key={p.id} className="border p-4 rounded">

            <p><b>User:</b> {p.user_id}</p>
            <p><b>Plan:</b> {p.plan}</p>
            <p><b>Amount:</b> Rs {p.amount}</p>
            <p><b>Transaction:</b> {p.transaction_id}</p>

            <button
              onClick={() => approvePayment(p)}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
            >
              Approve
            </button>

          </div>

        ))}

      </div>

    </div>
  )
}