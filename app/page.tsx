"use client"

import Link from "next/link"

export default function HomePage() {

  return (

    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* HERO */}

      <div className="text-center mb-16">

        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Pass Your Driving Test in Mauritius 🚗
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Practice smarter. Pass faster.
        </p>

        <p className="text-gray-500 mb-8">
          Prepare with real exam questions, adaptive learning, and full test simulations — all in one app.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4">

          <Link
            href="/learning"
            className="bg-blue-700 text-white px-6 py-3 rounded"
          >
            Start Practice 🚀
          </Link>

          <Link
            href="/premium"
            className="border px-6 py-3 rounded"
          >
            Get Premium 🔓
          </Link>

        </div>

      </div>

      {/* FEATURES */}

      <div className="grid md:grid-cols-3 gap-6 mb-20">

        <div className="border p-6 rounded text-center">

          <h2 className="text-xl font-semibold mb-2">
            1️⃣ Practice
          </h2>

          <p className="text-gray-600">
            Master road signs and driving rules step by step.
          </p>

        </div>

        <div className="border p-6 rounded text-center">

          <h2 className="text-xl font-semibold mb-2">
            2️⃣ Simulate
          </h2>

          <p className="text-gray-600">
            Take realistic exam simulations just like the official test.
          </p>

        </div>

        <div className="border p-6 rounded text-center">

          <h2 className="text-xl font-semibold mb-2">
            3️⃣ Pass
          </h2>

          <p className="text-gray-600">
            Build confidence and pass your driving test on the first try.
          </p>

        </div>

      </div>

      {/* PRICING */}

      <div className="text-center mb-10">

        <h2 className="text-3xl font-bold mb-6">
          Simple & Affordable Pricing
        </h2>

      </div>

      <div className="max-w-md mx-auto border rounded p-8 text-center shadow">

        <h3 className="text-xl font-semibold mb-2">
          DriveMaster Premium - launch offer
        </h3>

        <p className="text-4xl font-bold text-blue-700 mb-2">
          Rs 999
        </p>

        <p className="mb-4 text-gray-600">
          One-time payment
        </p>

        <p className="mb-6 text-green-600 font-semibold">
          ✔ Lifetime access — no recurring fees
        </p>

        <ul className="text-left mb-6 space-y-2">

          <li>✔ Full question bank (updated regularly)</li>
          <li>✔ Unlimited exam simulations</li>
          <li>✔ Smart learning mode (focus on weak areas)</li>
          <li>✔ Track your progress</li>

        </ul>

        <Link
          href="/premium"
          className="bg-blue-700 text-white px-6 py-3 rounded block"
        >
          Get Premium Access 🔓
        </Link>

        <p className="mt-4 text-sm text-gray-500">
          Secure payment via Juice
        </p>

      </div>

      {/* TRUST + URGENCY */}

      <div className="text-center mt-12 text-gray-600">

        <p className="mb-2">
          Trusted by learners in Mauritius 🇲🇺
        </p>

        <p className="text-sm text-red-500">
          Limited time: One-time payment only
        </p>

      </div>

    </div>

  )
}