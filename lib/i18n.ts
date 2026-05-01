export const translations = {
  fr: {
    login: "Connexion",
    loading: "Chargement...",
    noQuestions: "Aucune question disponible",
    loginRequired: "Connexion requise",
    officialMode: "Mode Examen Officiel",
    masterMode: "Mode Master",
    upgrade: "Mettre à niveau",
    next: "Suivant",
    explanation: "Explication"
  },
  en: {
    login: "Login",
    loading: "Loading...",
    noQuestions: "No questions available",
    loginRequired: "Login required",
    officialMode: "Official Exam Mode",
    masterMode: "Master Mode",
    upgrade: "Upgrade",
    next: "Next",
    explanation: "Explanation"
  }
}

export const getTranslator = (lang: string) => {
  const l = lang.toLowerCase() === "fr" ? "fr" : "en"

  return (key: keyof typeof translations.fr) => {
    return translations[l][key] || key
  }
}