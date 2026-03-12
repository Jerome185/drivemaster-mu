import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Exam from "@/components/Exam"

export default async function MasterPage() {

const cookieStore = cookies()

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

const { data: questions } = await supabase.rpc(
"generate_exam_questions"
)

return(

<div className="flex justify-center p-8">

<Exam questions={questions || []} isMaster />

</div>

)

}