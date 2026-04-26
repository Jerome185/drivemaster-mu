export type Question = {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string
  image_url?: string

  // 🔥 AJOUTE ÇA (important pour éviter ton erreur)
  weight?: number
  difficulty_level?: string
}