"use client"

import { useEffect,useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Exam from "@/components/Exam"
import { useLanguage } from "@/app/context/LanguageContext"
import Link from "next/link"

const supabase = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MasterPage(){

const { language } = useLanguage()

const [questions,setQuestions] = useState<any[]>([])
const [loading,setLoading] = useState(true)
const [isPremium,setIsPremium] = useState(false)


useEffect(()=>{

const loadData = async ()=>{

const { data:userData } = await supabase.auth.getUser()

if(!userData.user){
setLoading(false)
return
}

const { data:profile } = await supabase
.from("users")
.select("is_premium")
.eq("id",userData.user.id)
.single()

setIsPremium(profile?.is_premium)


if(profile?.is_premium){

const { data } = await supabase.rpc(
"get_master_exam_questions",
{ lang: language }
)

setQuestions(data || [])

}

setLoading(false)

}

loadData()

},[language])


if(loading){

return(
<div className="p-10 text-center">
Loading Master Mode...
</div>
)

}


if(!isPremium){

return(

<div className="max-w-xl mx-auto p-10 text-center">

<h1 className="text-3xl font-bold mb-4">
Master Mode 🔒
</h1>

<p className="mb-6">
Upgrade to Premium to access the hardest exam mode.
</p>

<Link
href="/premium"
className="bg-yellow-600 text-white px-6 py-3 rounded"
>

Upgrade to Premium

</Link>

</div>

)

}


return(

<div className="max-w-4xl mx-auto p-8">

<h1 className="text-3xl font-bold text-center mb-6 text-red-700">

Master Mode 🔥

</h1>

<div className="flex justify-center">

<Exam
questions={questions}
isMaster={true}
/>

</div>

</div>

)

}