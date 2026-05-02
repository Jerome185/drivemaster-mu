export const translations = {
  fr: {
    login: "Connexion",
    logout: "Déconnexion",
    loading: "Chargement...",
    noQuestions: "Aucune question disponible",
    loginRequired: "Connexion requise",
    officialMode: "Mode Examen Officiel",
    masterMode: "Mode Master",
    upgrade: "Mettre à niveau",
    next: "Suivant",
    explanation: "Explication",
    learning: "Apprentissage",
    official: "Examen",
    master: "Master",
    dashboard: "Tableau de bord",
    admin: "Admin",

    // 🔥 DASHBOARD
    dashboardTitle: "Ton tableau de performance",
    takeExam: "Passer l'examen officiel",
    totalExams: "Examens passés",
    passed: "Réussis",
    average: "Moyenne",
    bestScore: "Meilleur score",
    passRate: "Taux de réussite",
    trend: "Tendance",
    keepPracticing: "Continue à t'entraîner pour débloquer toutes les statistiques",
    scoreProgression: "Progression des scores",
    weakAreas: "Points faibles",
    noWeakAreas: "Aucun point faible détecté pour le moment. Continue à t'entraîner !",
    mistakes: "erreurs",
    recentAttempts: "Tentatives récentes"
  },

  en: {
    login: "Login",
    logout: "Logout",
    loading: "Loading...",
    noQuestions: "No questions available",
    loginRequired: "Login required",
    officialMode: "Official Exam Mode",
    masterMode: "Master Mode",
    upgrade: "Upgrade",
    next: "Next",
    explanation: "Explanation",
    learning: "Learning",
    official: "Official",
    master: "Master",
    dashboard: "Dashboard",
    admin: "Admin",

    // 🔥 DASHBOARD
    dashboardTitle: "Your Performance Dashboard",
    takeExam: "Take Official Exam",
    totalExams: "Total Exams",
    passed: "Passed",
    average: "Average",
    bestScore: "Best Score",
    passRate: "Pass Rate",
    trend: "Trend",
    keepPracticing: "Keep practicing to unlock full insights",
    scoreProgression: "Score Progression",
    weakAreas: "Weak Areas",
    noWeakAreas: "No weak areas detected yet. Keep practicing!",
    mistakes: "mistakes",
    recentAttempts: "Recent Attempts"
  }
}

export const getTranslator = (lang: string) => {
  const l = lang?.toLowerCase() === "fr" ? "fr" : "en"

  return (key: string) => {
    return translations[l][key as keyof typeof translations.fr] || key
  }
}