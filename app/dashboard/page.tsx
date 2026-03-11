import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import ProgressChart from "@/components/ProgressChart"
import Link from "next/link"

export default async function DashboardPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: attempts } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const total = attempts?.length || 0
  const passed = attempts?.filter(a => a.passed).length || 0
  const avg =
    attempts && attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.percentage, 0) /
            attempts.length
        )
      : 0

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Your Performance Dashboard 📊
      </h1>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <Card title="Total Exams" value={total} />
        <Card title="Passed" value={passed} />
        <Card title="Average Score" value={`${avg}%`} />

        <Link href="/learning">
          <div className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-xl shadow-md text-center cursor-pointer transition">
            <div className="text-lg font-semibold">Learning Mode</div>
            <div className="text-sm opacity-80 mt-1">
              Practice road signs
            </div>
          </div>
        </Link>
      </div>

      {/* Progress Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Score Progression
        </h2>

        <ProgressChart
          data={
            attempts?.map((a, i) => ({
              index: i + 1,
              percentage: a.percentage
            })) || []
          }
        />
      </div>

      {/* Recent Attempts */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Recent Attempts
        </h2>

        <div className="space-y-3">
          {attempts?.map(a => (
            <div
              key={a.id}
              className="flex justify-between border p-4 rounded-lg"
            >
              <div>
                <div className="font-semibold uppercase">
                  {a.exam_level}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>

              <div
                className={`font-bold ${
                  a.passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {a.percentage}% {a.passed ? "✅" : "❌"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
      <div className="text-gray-500 mb-2">{title}</div>
      <div className="text-3xl font-bold text-blue-700">{value}</div>
    </div>
  )
}
