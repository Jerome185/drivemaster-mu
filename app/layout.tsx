import "./globals.css"
import Header from "@/components/Header"
import Navbar from "@/components/Navbar"

export default function RootLayout({
children,
}: {
children: React.ReactNode
}) {

return (

<html lang="en">

<body>

<Navbar />

{children}

</body>

</html>

)

}