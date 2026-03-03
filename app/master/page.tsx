import { supabase } from "@/lib/supabase"
import Exam from "@/components/Exam"

export default async function MasterPage() {
  const { data, error } = await supabase.rpc("get_master_exam_questions")

  if (error || !data) {
    return (
      <main className="p-8">
        <h1>DriveMaster MU 🚗</h1>
        <p>Error loading Master exam.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-8">
      <h1 className="text-3xl font-bold text-red-700 mb-8">
        Master Ready Mode 🔥
      </h1>

      <Exam questions={data} isMaster />
    </main>
  )
}