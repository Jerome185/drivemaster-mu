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

  // 🔐 USER
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // 📊 ATTEMPTS
  const { data: attempts } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // 📊 STATS
  const total = attempts?.length || 0
  const passed = attempts?.filter(a => a.passed).length || 0

  const avg =
    total > 0
      ? Math.round(
          attempts!.reduce((sum, a) => sum + a.percentage, 0) / total
        )
      : 0

  const best =
    total > 0
      ? Math.max(...attempts!.map(a => a.percentage))
      : 0

  const passRate =
    total > 0 ? Math.round((passed / total) * 100) : 0

  const last = attempts?.[0]?.percentage || 0
  const prev = attempts?.[1]?.percentage || 0
  const trend = last - prev

  // ⚠️ WEAK AREAS
  const { data: weakAreas } = await supabase.rpc(
    "get_user_weak_categories",
    {
      user_id_input: user.id
    }
  )

  return (
    <main className="p-8 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Your Performance Dashboard 📊
      </h1>

      {/* 🚀 CTA */}
      <Link href="/official">
        <div className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl mb-6 text-center transition">
          Take Official Exam 🚀
        </div>
      </Link>

      {/* 📊 STATS */}
      <div className="grid md:grid-cols-5 gap-6 mb-10">
        <Card title="Total Exams" value={total} />
        <Card title="Passed" value={passed} />
        <Card title="Average" value={`${avg}%`} />
        <Card title="Best Score" value={`${best}%`} />
        <Card title="Pass Rate" value={`${passRate}%`} />
      </div>

      {/* 📉 TREND */}
      {total > 1 && (
        <div className="mb-10">
          <Card
            title="Trend"
            value={`${trend > 0 ? "+" : ""}${trend}%`}
          />
        </div>
      )}

      {/* ⚡ ENGAGEMENT */}
      {total < 3 && (
        <div className="bg-yellow-100 p-4 rounded mb-10 text-center">
          Keep practicing to unlock full insights 📊
        </div>
      )}

      {/* 📈 CHART */}
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

      {/* ⚠️ WEAK AREAS */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Weak Areas ⚠️
        </h2>

        {(!weakAreas || weakAreas.length === 0) && (
          <p className="text-gray-500">
            No weak areas detected yet. Keep practicing!
          </p>
        )}

        <div className="space-y-3">
          {weakAreas?.map((area: any) => (
            <div
              key={area.category_name}
              className="flex justify-between border p-3 rounded-lg"
            >
              <span className="font-medium">
                {area.category_name}
              </span>

              <span className="text-red-600 font-bold">
                {area.mistakes} mistakes
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 🕘 RECENT ATTEMPTS */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Recent Attempts
        </h2>

        <div className="space-y-3">
          {attempts?.slice(0, 10).map(a => (
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
                  a.passed
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {a.score}/{a.total_score} ({a.percentage}%)
                {a.passed ? " ✅" : " ❌"}
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}

function Card({
  title,
  value
}: {
  title: string
  value: any
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
      <div className="text-gray-500 mb-2">
        {title}
      </div>

      <div className="text-3xl font-bold text-blue-700">
        {value}
      </div>
    </div>
  )
}