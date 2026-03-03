import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function importQuestions() {
  const filePath = path.join(process.cwd(), "data/questions.json")
  const file = fs.readFileSync(filePath, "utf-8")
  const questions = JSON.parse(file)

  for (const q of questions) {
    // 1️⃣ Find category ID
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("name", q.category)
      .single()

    if (!category) {
      console.log(`Category not found: ${q.category}`)
      continue
    }

    // 2️⃣ Insert question
    const { data: insertedQuestion, error: questionError } =
      await supabase
        .from("questions")
        .insert({
          category_id: category.id,
          difficulty_level: q.difficulty_level,
          weight: q.weight,
          exam_level: q.exam_level
        })
        .select()
        .single()

    if (questionError) {
      console.error("Question insert error:", questionError)
      continue
    }

    // 3️⃣ Insert translation (EN only for now)
    const { error: translationError } = await supabase
      .from("question_translations")
      .insert({
        question_id: insertedQuestion.id,
        language_code: "EN",
        question_text: q.EN.question_text,
        option_a: q.EN.option_a,
        option_b: q.EN.option_b,
        option_c: q.EN.option_c,
        option_d: q.EN.option_d,
        correct_option: q.EN.correct_option,
        explanation: q.EN.explanation
      })

    if (translationError) {
      console.error("Translation insert error:", translationError)
    }

    console.log(`Inserted: ${q.EN.question_text}`)
  }

  console.log("Import finished 🚀")
}

importQuestions()