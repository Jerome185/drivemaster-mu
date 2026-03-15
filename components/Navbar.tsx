"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { useLanguage } from "@/app/context/LanguageContext"

const supabase = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Navbar(){

const router = useRouter()

const [user,setUser] = useState<any>(null)

const { language,setLanguage } = useLanguage()


useEffect(()=>{

const loadUser = async ()=>{

const { data } = await supabase.auth.getUser()

setUser(data.user)

}

loadUser()

},[])


const handleLogout = async ()=>{

await supabase.auth.signOut()

router.push("/login")

}


return(

<nav className="flex items-center justify-between px-6 py-4 border-b bg-white">

{/* LOGO */}

<Link
href="/"
className="text-xl font-bold text-blue-700"
>

DriveMaster MU 🚗

</Link>


{/* MENU */}

<div className="flex items-center gap-6">

<Link href="/dashboard">Dashboard</Link>

<Link href="/learning">Learning</Link>

<Link href="/official">Official Exam</Link>

<Link href="/master">Master Mode</Link>

<Link
href="/premium"
className="text-yellow-600 font-semibold"
>
Premium
</Link>


{/* LANGUAGE */}

<select
value={language}
onChange={(e)=>{

const newLang = e.target.value

setLanguage(newLang)

localStorage.setItem("lang",newLang)

window.dispatchEvent(
new CustomEvent("languageChange",{detail:newLang})
)

}}
className="border p-1 rounded"
>

<option value="EN">EN</option>
<option value="FR">FR</option>

</select>


{/* LOGOUT */}

{user &&(

<button
onClick={handleLogout}
className="bg-red-500 text-white px-3 py-1 rounded"
>

Logout

</button>

)}

</div>

</nav>

)

}