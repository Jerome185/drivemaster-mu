"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useState } from "react"

const supabase = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PremiumPage(){

const [txId,setTxId] = useState("")
const [message,setMessage] = useState("")

const submitPayment = async()=>{

const { data:userData } = await supabase.auth.getUser()

if(!userData.user) return

await supabase
.from("payments")
.insert({
user_id: userData.user.id,
amount: 2000,
payment_method: "Juice",
transaction_id: txId
})

setMessage("Payment submitted for verification.")

}

return(

<div className="max-w-xl mx-auto p-8">

<h1 className="text-3xl font-bold mb-6 text-center">
DriveMaster Premium
</h1>

<div className="border p-6 rounded">

<p className="mb-4 text-lg">
Premium Access: <b>Rs 2000</b>
</p>

<p className="mb-4">
Pay using Juice:
</p>

<div className="bg-gray-100 p-4 rounded mb-4">

<p>MCB Juice Number:</p>
<p className="font-bold text-xl">
5771 8436
</p>

</div>

<p className="mb-2">
Enter your Juice Transaction ID:
</p>

<input
value={txId}
onChange={(e)=>setTxId(e.target.value)}
className="border p-2 w-full mb-4"
/>

<button
onClick={submitPayment}
className="bg-blue-700 text-white px-4 py-2 rounded"
>

Submit Payment

</button>

{message && (

<p className="mt-4 text-green-600">
{message}
</p>

)}

</div>

</div>

)

}