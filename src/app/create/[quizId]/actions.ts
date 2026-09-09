'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { quizzes, questions, choices } from '@/db/schema'
import { getSession } from '@/lib/session'

async function requireOwnedQuiz(quizId: string) {
  const session = await getSession()
  if (!session || session.role !== 'creator') redirect('/')

  const db = getDb()
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId))
  if (!quiz || quiz.creatorName !== session.name) redirect('/create')

  return { db, quiz, session }
}

export async function addQuestion(quizId: string, formData: FormData) {
  const { db } = await requireOwnedQuiz(quizId)
  const text = String(formData.get('text') ?? '').trim()
  if (!text) return

  const existing = await db.select().from(questions).where(eq(questions.quizId, quizId))

  await db.insert(questions).values({
    quizId,
    text,
    order: existing.length,
  })

  revalidatePath(`/create/${quizId}`)
}

export async function deleteQuestion(quizId: string, questionId: string) {
  const { db } = await requireOwnedQuiz(quizId)
  await db.delete(questions).where(eq(questions.id, questionId))
  revalidatePath(`/create/${quizId}`)
}

export async function addChoice(quizId: string, questionId: string, formData: FormData) {
  const { db } = await requireOwnedQuiz(quizId)
  const text = String(formData.get('text') ?? '').trim()
  if (!text) return

  const existing = await db.select().from(choices).where(eq(choices.questionId, questionId))

  await db.insert(choices).values({
    questionId,
    text,
    order: existing.length,
  })

  revalidatePath(`/create/${quizId}`)
}

export async function deleteChoice(quizId: string, choiceId: string) {
  const { db } = await requireOwnedQuiz(quizId)
  await db.delete(choices).where(eq(choices.id, choiceId))
  revalidatePath(`/create/${quizId}`)
}

export async function setCorrectChoice(quizId: string, questionId: string, choiceId: string) {
  const { db } = await requireOwnedQuiz(quizId)

  await db.update(choices).set({ isCorrect: false }).where(eq(choices.questionId, questionId))
  await db.update(choices).set({ isCorrect: true }).where(eq(choices.id, choiceId))

  revalidatePath(`/create/${quizId}`)
}

export async function publishQuiz(quizId: string) {
  const { db } = await requireOwnedQuiz(quizId)

  const qs = await db.select().from(questions).where(eq(questions.quizId, quizId))
  if (qs.length === 0) {
    redirect(`/create/${quizId}?error=need-question`)
  }

  const questionIds = qs.map((q) => q.id)
  const allChoices = await db.select().from(choices).where(inArray(choices.questionId, questionIds))

  for (const q of qs) {
    const cs = allChoices.filter((c) => c.questionId === q.id)
    const correctCount = cs.filter((c) => c.isCorrect).length
    if (cs.length < 2 || correctCount !== 1) {
      redirect(`/create/${quizId}?error=invalid-question`)
    }
  }

  await db.update(quizzes).set({ published: true }).where(eq(quizzes.id, quizId))
  revalidatePath(`/create/${quizId}`)
  revalidatePath('/quizzes')
}
