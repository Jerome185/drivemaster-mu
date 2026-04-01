import "./globals.css"
import Navbar from "@/components/Navbar"
import { LanguageProvider } from "@/app/contexts/LanguageContext"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>

        <LanguageProvider>

          {/* NAVBAR FIXE */}
          <Navbar />

          {/* CONTENU AVEC OFFSET */}
          <main className="pt-20">
            {children}
          </main>

        </LanguageProvider>

      </body>
    </html>
  )
}