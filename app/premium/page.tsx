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

  if(loading){
    return <div className="p-10 text-center">Loading...</div>
  }

  return(

    <div className="max-w-xl mx-auto p-10 text-center">

      <h1 className="text-3xl font-bold mb-6">
        Upgrade to Premium 🚀
      </h1>

      <div className="border p-4 mb-4">
        <h2>1 Month</h2>
        <p>Rs 500</p>
      </div>

      <div className="border p-4 mb-4">
        <h2>3 Months</h2>
        <p>Rs 1200</p>
      </div>

      <div className="border p-4 mb-6 bg-blue-600 text-white">
        <h2>Lifetime 🔥 launch offer</h2>
        <p>Rs 999</p>
      </div>

      <div className="bg-gray-100 p-4 mb-4">
        Pay via Juice:<br/>
        <strong>5771 8436</strong>
      </div>

      <input
        placeholder="Transaction ID"
        className="w-full p-2 border rounded mb-4"
      />

      <button className="w-full bg-green-600 text-white p-3 rounded">
        Submit Payment
      </button>

    </div>

  )

}