import Link from "next/link"

export default function LandingPage() {

return (

<main className="min-h-screen bg-white text-gray-900">

{/* HERO */}

<section className="text-center py-20 px-6">

<h1 className="text-5xl font-bold mb-6 text-blue-900">
Pass Your Driving Test in Mauritius 🚗
</h1>

<p className="text-xl max-w-2xl mx-auto mb-8">
DriveMaster MU helps you practice real driving theory
questions with adaptive learning and full exam simulations.
</p>

<div className="flex justify-center gap-4">

<Link
href="/official"
className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
>
Start Practice
</Link>

<Link
href="/login"
className="border border-gray-400 px-6 py-3 rounded-lg"
>
Login
</Link>

</div>

</section>


{/* FEATURES */}

<section className="py-16 bg-gray-100">

<h2 className="text-3xl font-bold text-center mb-12">
Why DriveMaster MU?
</h2>

<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

<div className="p-6 bg-white rounded shadow">
<h3 className="font-bold text-xl mb-2">
Real Exam Simulation
</h3>
<p>
Practice full driving theory exams just like the
official Mauritius test.
</p>
</div>

<div className="p-6 bg-white rounded shadow">
<h3 className="font-bold text-xl mb-2">
Adaptive Learning
</h3>
<p>
Our system focuses on your weak areas so you improve faster.
</p>
</div>

<div className="p-6 bg-white rounded shadow">
<h3 className="font-bold text-xl mb-2">
Track Your Progress
</h3>
<p>
Monitor your scores and see which categories you must improve.
</p>
</div>

</div>

</section>


{/* HOW IT WORKS */}

<section className="py-16">

<h2 className="text-3xl font-bold text-center mb-12">
How It Works
</h2>

<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">

<div>
<h3 className="font-semibold text-xl mb-2">1️⃣ Practice</h3>
<p>Learn road signs and driving rules.</p>
</div>

<div>
<h3 className="font-semibold text-xl mb-2">2️⃣ Simulate</h3>
<p>Take full official exam simulations.</p>
</div>

<div>
<h3 className="font-semibold text-xl mb-2">3️⃣ Pass</h3>
<p>Be ready for the real driving test.</p>
</div>

</div>

</section>


{/* PRICING */}

<section className="py-16 bg-gray-100 text-center">

<h2 className="text-3xl font-bold mb-8">
Simple Pricing
</h2>

<div className="max-w-md mx-auto bg-white p-8 rounded shadow">

<h3 className="text-2xl font-bold mb-4">
DriveMaster Premium
</h3>

<p className="text-4xl font-bold text-blue-800 mb-4">
Rs 2,000
</p>

<ul className="mb-6 text-left space-y-2">

<li>✔ Full question bank</li>
<li>✔ Unlimited exam simulations</li>
<li>✔ Adaptive learning mode</li>
<li>✔ Progress tracking</li>

</ul>

<Link
href="/login"
className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
>
Get Started
</Link>

</div>

</section>


{/* CTA */}

<section className="py-20 text-center">

<h2 className="text-3xl font-bold mb-6">
Start Practicing Today
</h2>

<Link
href="/official"
className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold"
>
Start Free Practice
</Link>

</section>

</main>

)

}