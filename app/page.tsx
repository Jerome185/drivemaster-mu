import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold text-blue-700">
        DriveMaster MU 🚗
      </h1>

      <Link
        href="/official"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
      >
        Start Official Exam
      </Link>

      <Link
        href="/master"
        className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg"
      >
        Start Master Ready
      </Link>
    </main>
  )
}