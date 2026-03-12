"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useState, useEffect } from "react"

const supabase = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LearningPage() {

const [lang, setLang] = useState("EN")
const [categories, setCategories] = useState<any[]>([])
const [category, setCategory] = useState("")

const [question, setQuestion] = useState<any>(null)
const [selected, setSelected] = useState<string | null>(null)
const [showResult, setShowResult] = useState(false)
const [loading, setLoading] = useState(false)


// LOAD LANGUAGE FROM NAVBAR

useEffect(()=>{

const savedLang = localStorage.getItem("lang")

if(savedLang){
setLang(savedLang)
}

const handleLangChange = (e:any)=>{
setLang(e.detail)
}

window.addEventListener("languageChange", handleLangChange)

return ()=>{
window.removeEventListener("languageChange", handleLangChange)
}

},[])


// LOAD CATEGORIES

const loadCategories = async () => {

const { data } = await supabase.rpc(
"get_categories_by_language",
{ lang }
)

if(data){

setCategories(data)

if(data.length > 0){
setCategory(data[0].name)
}

}

}


// LOAD QUESTION

const loadQuestion = async () => {

if(!category) return

setLoading(true)

const { data } = await supabase.rpc(
"get_learning_question",
{
category_name_input: category,
lang
}
)

if (data && data.length > 0) {

setQuestion(data[0])
setSelected(null)
setShowResult(false)

}

setLoading(false)

}


// LOAD CATEGORIES WHEN LANGUAGE CHANGES

useEffect(()=>{
loadCategories()
},[lang])


// LOAD QUESTION WHEN CATEGORY CHANGES

useEffect(()=>{
loadQuestion()
},[category])


// HANDLE ANSWER

const handleSelect = (option: string) => {

if (showResult) return

setSelected(option)
setShowResult(true)

}
const { data:userData } = await supabase.auth.getUser()

if(userData?.user){

await supabase.rpc(
"update_practice_streak",
{ user_id_input: userData.user.id }
)

}

// BUTTON STYLE

const getButtonStyle = (letter:string) => {

if (!showResult) return "border hover:bg-gray-100"

if (letter === question.correct_option)
return "bg-green-500 text-white"

if (letter === selected)
return "bg-red-500 text-white"

return "border opacity-50"

}


// UI

return (

<div className="max-w-xl mx-auto p-8">

<h1 className="text-3xl font-bold mb-6">
Learning Mode 🧠
</h1>


{/* CATEGORY SELECTOR */}

<div className="flex gap-3 mb-6">

<select
className="border p-2 rounded"
value={category}
onChange={(e)=>setCategory(e.target.value)}
>

{categories.map((c)=>(
<option key={c.id} value={c.name}>
{c.name}
</option>
))}

</select>

<button
onClick={loadQuestion}
className="bg-blue-600 text-white px-4 py-2 rounded"
>

New Question

</button>

</div>


{/* LOADING */}

{loading && (

<p className="text-gray-500">
Loading question...
</p>

)}


{/* QUESTION */}

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