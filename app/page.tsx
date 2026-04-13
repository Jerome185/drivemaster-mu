"use client"

import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="text-center px-6 py-16">

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Pass your driving test faster 🚗
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Practice real exam questions. Learn faster. Pass with confidence.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/learning"
            className="bg-blue-900 text-white px-6 py-3 rounded-lg"
          >
            Start Free
          </Link>

          <Link
            href="/premium"
            className="border px-6 py-3 rounded-lg"
          >
            View Plans
          </Link>
        </div>

      </section>

      {/* ================= BENEFITS ================= */}
      <section className="bg-gray-50 py-12 px-6">

        <h2 className="text-2xl font-bold text-center mb-10">
          Why DriveMaster?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 text-center">

          <div>
            <h3 className="font-semibold text-lg">🎯 Real exam questions</h3>
            <p className="text-gray-600 mt-2">
              Practice questions similar to the real driving test.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg">⚡ Learn faster</h3>
            <p className="text-gray-600 mt-2">
              Improve with explanations and smart repetition.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg">📱 Practice anywhere</h3>
            <p className="text-gray-600 mt-2">
              Mobile-friendly and easy to use anytime.
            </p>
          </div>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-12 px-6 text-center">

        <h2 className="text-2xl font-bold mb-10">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div>
            <h3 className="font-semibold">1. Practice</h3>
            <p className="text-gray-600 mt-2">
              Answer real driving test questions
            </p>
          </div>

          <div>
            <h3 className="font-semibold">2. Learn</h3>
            <p className="text-gray-600 mt-2">
              Understand mistakes with explanations
            </p>
          </div>

          <div>
            <h3 className="font-semibold">3. Pass</h3>
            <p className="text-gray-600 mt-2">
              Be fully prepared for your exam
            </p>
          </div>

        </div>

      </section>

      {/* ================= PRICING ================= */}
      <section className="bg-gray-50 py-12 px-6">

        <h2 className="text-2xl font-bold text-center mb-10">
          Choose your plan
        </h2>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* OFFICIAL */}
          <div className="border rounded-xl p-6 text-center">

            <h3 className="text-xl font-bold mb-2">Official</h3>
            <p className="text-gray-500 mb-4">Start your journey</p>

            <p className="text-3xl font-bold mb-4">Rs 999</p>

            <ul className="space-y-2 mb-6">
              <li>✅ Unlimited questions</li>
              <li>✅ Practice anytime</li>
              <li>❌ Master mode</li>
            </ul>

            <Link
              href="/premium"
              className="bg-blue-900 text-white px-6 py-2 rounded"
            >
              Get Started
            </Link>

          </div>

          {/* MASTER */}
          <div className="border-2 border-red-600 rounded-xl p-6 text-center">

            <h3 className="text-xl font-bold text-red-600 mb-2">
              Master 🔥
            </h3>

            <p className="text-gray-500 mb-4">
              Pass with confidence
            </p>

            <p className="text-3xl font-bold mb-4">Rs 1499</p>

            <ul className="space-y-2 mb-6">
              <li>✅ Everything in Official</li>
              <li>✅ Hard questions</li>
              <li>✅ Exam simulation</li>
            </ul>

            <Link
              href="/premium"
              className="bg-red-600 text-white px-6 py-2 rounded"
            >
              Go Master 🚀
            </Link>

          </div>

        </div>

      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="text-center py-16">

        <h2 className="text-3xl font-bold mb-4">
          Ready to pass your test?
        </h2>

        <Link
          href="/signup"
          className="bg-blue-900 text-white px-8 py-3 rounded-lg"
        >
          Start Now 🚀
        </Link>

      </section>

    </div>
  )
}