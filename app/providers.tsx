"use client"

import { LanguageProvider } from "@/app/contexts/LanguageContext"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return <LanguageProvider>{children}</LanguageProvider>
}