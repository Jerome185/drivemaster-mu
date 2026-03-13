"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

export default function Navbar() {

const [lang, setLang] = useState("EN")

useEffect(() => {
const savedLang = localStorage.getItem("lang")
if (savedLang) setLang(savedLang)
}, [])

const [streak, setStreak] = useState(0)

useEffect(()=>{

const loadStreak = async () => {

const { data:userData } = await supabase.auth.getUser()

if(!userData?.user) return

const { data } = await supabase
.from("practice_streaks")
.select("streak_count")
.eq("user_id", userData.user.id)
.single()

if(data){
setStreak(data.streak_count)
}

}

loadStreak()

},[])



const changeLanguage = (newLang:string) => {

setLang(newLang)
localStorage.setItem("lang", newLang)

window.dispatchEvent(
new CustomEvent("languageChange", { detail: newLang })
)

}

return (

<nav className="w-full bg-white border-b shadow-sm">

<div className="max-w-6xl mx-auto flex justify-between items-center p-4">

{/* LOGO */}

<Link href="/" className="text-xl font-bold text-blue-700">
DriveMaster MU 🚗
</Link>

{/* NAV LINKS */}

<div className="flex items-center gap-6">

<Link href="/dashboard">
Dashboard
</Link>

<Link href="/learning">
Learning
</Link>

<Link href="/official">
Official Exam
</Link>

<Link href="/master">
Master Mode
</Link>

{/* LANGUAGE SWITCH */}

<select
value={lang}
onChange={(e)=>changeLanguage(e.target.value)}
className="border rounded px-2 py-1"
>

<div className="flex items-center gap-2 text-orange-600 font-semibold">
🔥 {streak}
</div>

<option value="EN">EN</option>
<option value="FR">FR</option>

</select>

</div>

</div>

</nav>

)

}