import "./globals.css"
import Navbar from "@/components/Navbar"
import { LanguageProvider } from "./context/LanguageContext"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body>

        <LanguageProvider>

          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>

        </LanguageProvider>

      </body>
    </html>
  )
}