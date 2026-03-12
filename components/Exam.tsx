"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useState, useEffect } from "react"

const supabase = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Question = {
id: string
category_name?: string
question_text: string
option_a: string
option_b: string
option_c: string
option_d: string
correct_option: string
explanation: string
weight: number
difficulty_level: string
image_url?: string
}

export default function Exam({
questions,
isMaster = false
}: {
questions: Question[]
isMaster?: boolean
}) {

const [currentIndex, setCurrentIndex] = useState(0)
const [score, setScore] = useState(0)
const [selected, setSelected] = useState<string | null>(null)
const [showResult, setShowResult] = useState(false)
const [examFinished, setExamFinished] = useState(false)
const [failedCritical, setFailedCritical] = useState(false)
const [reviewMode, setReviewMode] = useState(false)

const [sessionId, setSessionId] = useState<string | null>(null)
const [answers, setAnswers] = useState<any>({})

const timePerQuestion = isMaster ? 30 : 60
const [timeLeft, setTimeLeft] = useState(timePerQuestion)

const currentQuestion = questions[currentIndex]
const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5)

const totalPossibleScore = questions.reduce(
(sum, q) => sum + q.weight,
0
)

const percentage = Math.round((score / totalPossibleScore) * 100)
const passThreshold = isMaster ? 85 : 70
const passed = percentage >= passThreshold && !failedCritical

/* ANTI REFRESH */

useEffect(() => {

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
e.preventDefault()
e.returnValue = "Exam in progress"
}

window.addEventListener("beforeunload", handleBeforeUnload)

return () => {
window.removeEventListener("beforeunload", handleBeforeUnload)
}

}, [])

/* ANTI TAB SWITCH */

useEffect(() => {

const handleVisibility = () => {

if (document.hidden && !examFinished) {

alert("Leaving the exam tab will submit your exam.")
setExamFinished(true)

}

}

document.addEventListener("visibilitychange", handleVisibility)

return () => {
document.removeEventListener("visibilitychange", handleVisibility)
}

}, [examFinished])

/* CREATE OR RESUME SESSION */

useEffect(() => {

const initSession = async () => {

const { data: userData } = await supabase.auth.getUser()
const user = userData.user

if (!user) return

const { data: existing } = await supabase
.from("exam_sessions")
.select("*")
.eq("user_id", user.id)
.eq("status", "in_progress")
.maybeSingle()

if (existing) {

setSessionId(existing.id)

} else {

const { data: newSession } = await supabase
.from("exam_sessions")
.insert({
user_id: user.id,
exam_level: isMaster ? "master" : "official",
total_questions: questions.length,
status: "in_progress"
})
.select()
.single()

setSessionId(newSession.id)

}

}

initSession()

}, [])

/* LOAD PREVIOUS ANSWERS */

useEffect(() => {

if (!sessionId) return

const loadAnswers = async () => {

const { data } = await supabase
.from("exam_answers")
.select("*")
.eq("exam_session_id", sessionId)

if (!data) return

const loaded: any = {}

data.forEach((a) => {
loaded[a.question_id] = a.selected_option
})

setAnswers(loaded)

const answeredCount = Object.keys(loaded).length

if (answeredCount > 0) {
setCurrentIndex(answeredCount)
}

}

loadAnswers()

}, [sessionId])

/* SAVE FINAL RESULT */

useEffect(() => {

if (!examFinished) return

const saveResult = async () => {

const { data: userData } = await supabase.auth.getUser()
const user = userData.user

if (!user) return

await supabase.from("exam_attempts").insert({
user_id: user.id,
exam_level: isMaster ? "master" : "official",
score,
total_score: totalPossibleScore,
percentage,
passed
})

await supabase
.from("exam_sessions")
.update({
status: "completed",
finished_at: new Date()
})
.eq("id", sessionId)

}

saveResult()

}, [examFinished])

/* RESET TIMER */

useEffect(() => {
setTimeLeft(timePerQuestion)
}, [currentIndex])

/* TIMER */

useEffect(() => {

if (examFinished) return

if (timeLeft <= 0) {
setExamFinished(true)
return
}

const interval = setInterval(() => {
setTimeLeft((prev) => prev - 1)
}, 1000)

return () => clearInterval(interval)

}, [timeLeft, examFinished])

/* ANSWER SELECT */

const handleSelect = async (option: string) => {

if (selected || examFinished) return

setSelected(option)
setShowResult(true)

const isCorrect = option === currentQuestion.correct_option

setAnswers({
...answers,
[currentQuestion.id]: option
})

await supabase.from("exam_answers").insert({
exam_session_id: sessionId,
question_id: currentQuestion.id,
selected_option: option,
correct_option: currentQuestion.correct_option,
is_correct: isCorrect
})

if (isCorrect) {

setScore((prev) => prev + currentQuestion.weight)

} else {

if (
currentQuestion.difficulty_level === "critical" ||
(isMaster && currentQuestion.difficulty_level === "major")
) {

setFailedCritical(true)
setExamFinished(true)

}

}

}

/* NEXT QUESTION */

const handleNext = () => {

setSelected(null)
setShowResult(false)

if (currentIndex + 1 < questions.length) {
setCurrentIndex((prev) => prev + 1)
} else {
setExamFinished(true)
}

}

/* RESULT SCREEN */

if (examFinished && !reviewMode) {

return (

<div className="max-w-xl w-full border p-8 rounded shadow bg-white text-center">

<h2 className={`text-3xl font-bold mb-4 ${
passed ? "text-green-600" : "text-red-600"
}`}>

{passed ? "🎉 PASSED" : "❌ FAILED"}

</h2>

<p className="mb-2">
Score: {score} / {totalPossibleScore}
</p>

<p className="mb-6">
Percentage: {percentage}%
</p>

<div className="flex flex-col gap-3">

<button
onClick={() => setReviewMode(true)}
className="bg-green-700 text-white px-4 py-2 rounded"

>

Review Answers </button>

<button
onClick={() => window.location.reload()}
className="bg-blue-900 text-white px-4 py-2 rounded"

>

Retry Exam </button>

</div>

</div>

)

}

/* REVIEW SCREEN */

if (reviewMode) {

return (

<div className="max-w-2xl w-full border p-8 rounded shadow bg-white">

<h2 className="text-2xl font-bold mb-6">
Exam Review
</h2>

<div className="space-y-6">

{questions.map((q, index) => {

const userAnswer = answers[q.id]
const correct = userAnswer === q.correct_option

return (

<div key={q.id} className="border p-4 rounded">

<p className="font-semibold mb-2">
Question {index + 1}
</p>

<p className="mb-2">
{q.question_text}
</p>

{q.image_url && ( <img src={q.image_url} className="w-32 my-2"/>
)}

<p className={`font-semibold ${
correct ? "text-green-600" : "text-red-600"
}`}>
Your answer: {userAnswer ?? "No answer"}
</p>

<p className="text-blue-700">
Correct answer: {q.correct_option}
</p>

<p className="text-gray-600 mt-2">
Explanation: {q.explanation}
</p>

</div>

)

})}

</div>

<button
onClick={() => window.location.reload()}
className="mt-6 bg-blue-900 text-white px-4 py-2 rounded"

>

Back to Home </button>

</div>

)

}

/* EXAM SCREEN */

return (

<div className="max-w-xl w-full border p-6 rounded shadow">

<p className="text-sm text-gray-500 mb-2">
Question {currentIndex + 1} of {questions.length}
</p>

<div className="w-full bg-gray-300 h-3 rounded mb-4 overflow-hidden">
  <div
    className="bg-blue-600 h-full transition-all duration-300"
    style={{
      width: `${((currentIndex + 1) / questions.length) * 100}%`
    }}
  />
</div>

<p className="text-sm font-semibold text-red-600 mb-4">
Time left: {timeLeft}s
</p>

<h2 className="text-xl font-semibold mb-4">
{currentQuestion.question_text}
</h2>

{currentQuestion.image_url && ( <img
src={currentQuestion.image_url}
alt="road-sign"
className="my-4 w-40 mx-auto"
/>
)}

<div className="space-y-2">

{["A","B","C","D"].map((letter) => {

const optionText =
currentQuestion[`option_${letter.toLowerCase()}` as keyof Question] as string

return (

<button
key={letter}
onClick={() => handleSelect(letter)}
className="w-full text-left border p-2 rounded hover:bg-gray-100"

>

{letter}. {optionText}

</button>

)

})}

</div>

{showResult && (

<div className="mt-4">

{selected === currentQuestion.correct_option ? (

<p className="text-green-600 font-semibold">Correct ✅</p>

) : (

<p className="text-red-600 font-semibold">
Incorrect ❌ — Correct answer: {currentQuestion.correct_option}
</p>

)}

<p className="mt-2 text-sm text-gray-600">
{currentQuestion.explanation}
</p>

<button
onClick={handleNext}
className="mt-4 bg-blue-900 text-white px-4 py-2 rounded"

>

Next Question </button>

</div>

)}

</div>

)

}
