import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import Exam from "@/components/Exam"

export default async function OfficialPage() {

const cookieStore = await cookies()

const supabase = createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
cookies:{
get(name:string){
return cookieStore.get(name)?.value
},
set(){},
remove(){}
}
}
)

const { data:{ user } } = await supabase.auth.getUser()

if(!user){
redirect("/login")
}

const { data:questions, error } =
await supabase.rpc("get_official_exam_questions")

if(error || !questions){
return <div className="p-8">Error loading exam.</div>
}

return(

<main className="flex min-h-screen flex-col items-center justify-center bg-white p-8">

<h1 className="text-3xl font-bold text-blue-900 mb-8">
Official Exam Mode 🟢
</h1>

<Exam questions={questions} />

</main>

)

}