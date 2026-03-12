"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"

const supabase = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LearningPage() {

const [category, setCategory] = useState("Signalisation")
const [question, setQuestion] = useState<any>(null)
const [selected, setSelected] = useState<string | null>(null)
const [showResult, setShowResult] = useState(false)
const [loading, setLoading] = useState(false)

const loadQuestion = async () => {

setLoading(true)

const { data } = await supabase.rpc(
"get_adaptive_learning_questions",
{
category_name_input: category,
lang: "EN"
}
)

if (data && data.length > 0) {
setQuestion(data[0])
setSelected(null)
setShowResult(false)
}

setLoading(false)

}

useEffect(()=>{
loadQuestion()
},[category])

const handleSelect = (option: string) => {

if (showResult) return

setSelected(option)
setShowResult(true)

}

const getButtonStyle = (letter:string) => {

if (!showResult) return "border hover:bg-gray-100"

if (letter === question.correct_option)
return "bg-green-500 text-white"

if (letter === selected)
return "bg-red-500 text-white"

return "border opacity-50"

}

return (

<div className="max-w-xl mx-auto p-8">

<h1 className="text-3xl font-bold mb-6">
Learning Mode 🧠
</h1>

<div className="flex gap-3 mb-6">

<select
className="border p-2 rounded"
value={category}
onChange={(e)=>setCategory(e.target.value)}
>

<option>Signalisation</option>
<option>Priorités</option>
<option>Ronds-points</option>
<option>Sécurité routière</option>

</select>

<button
onClick={loadQuestion}
className="bg-blue-600 text-white px-4 py-2 rounded"
>

New Question

</button>

</div>

{loading && (

<p className="text-gray-500">
Loading question...
</p>

)}

{question && !loading && (

<div className="border p-6 rounded-xl shadow">

<h2 className="text-lg font-semibold mb-4">
{question.question_text}
</h2>

{question.image_url && (

<img
src={question.image_url}
className="w-40 mb-4 rounded"
/>

)}

<div className="space-y-2">

{["A","B","C","D"].map((letter)=>{

const text =
question[`option_${letter.toLowerCase()}`]

return(

<button
key={letter}
onClick={()=>handleSelect(letter)}
className={`w-full p-3 text-left rounded ${getButtonStyle(letter)}`}
>

{letter}. {text}

</button>

)

})}

</div>

{showResult && (

<div className="mt-4">

{selected === question.correct_option ? (

<p className="text-green-600 font-semibold">
✅ Correct
</p>

):(

<p className="text-red-600 font-semibold">
❌ Incorrect — Correct answer: {question.correct_option}
</p>

)}

<p className="text-gray-600 mt-2">
{question.explanation}
</p>

<button
onClick={loadQuestion}
className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
>

Next Question

</button>

</div>

)}

</div>

)}

</div>

)

}