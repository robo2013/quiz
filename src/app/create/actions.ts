'use server'

import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { quizzes } from '@/db/schema'
import { getSession } from '@/lib/session'

export async function createQuiz(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'creator') {
    redirect('/')
  }

  const title = String(formData.get('title') ?? '').trim()
  if (!title) {
    redirect('/create')
  }

  const db = getDb()
  const [quiz] = await db
    .insert(quizzes)
    .values({ title, creatorName: session.name })
    .returning()

  redirect(`/create/${quiz.id}`)
}
