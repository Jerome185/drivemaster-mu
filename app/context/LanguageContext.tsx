"use client"

import { createContext, useContext, useState } from "react"

const LanguageContext = createContext<any>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {

  const [language, setLanguage] = useState("EN")

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(){
  return useContext(LanguageContext)
}