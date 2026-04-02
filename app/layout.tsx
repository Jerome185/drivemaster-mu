import "./globals.css"
import Header from "@/components/Header"
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

          {/* HEADER CORRECT */}
          <Header />

          {/* CONTENU AVEC OFFSET */}
          <main className="pt-20">
            {children}
          </main>

        </LanguageProvider>

      </body>
    </html>
  )
}