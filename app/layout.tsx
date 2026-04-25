import "./globals.css"
import Header from "@/components/Header"
import Providers from "./providers"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>

        <Providers>
          <Header />

          <main className="pt-20">
            {children}
          </main>
        </Providers>

      </body>
    </html>
  )
}