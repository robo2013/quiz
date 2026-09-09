import { redirect, notFound } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { quizzes, questions, choices } from '@/db/schema'
import { getSession } from '@/lib/session'

export default async function TakeQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = await params

  const session = await getSession()
  if (!session || session.role !== 'taker') redirect('/')

  const db = getDb()
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId))
  if (!quiz || !quiz.published) notFound()

  const questionRows = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quizId))
    .orderBy(questions.order)

  const questionIds = questionRows.map((q) => q.id)
  const choiceRows = questionIds.length
    ? await db.select().from(choices).where(inArray(choices.questionId, questionIds))
    : []

  return (
    <main className="max-w-xl mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>
      <form action={`/quizzes/${quizId}/result`} method="get" className="space-y-6">
        {questionRows.map((question, qIndex) => {
          const questionChoices = choiceRows.filter((c) => c.questionId === question.id)
          return (
            <div key={question.id}>
              <p className="font-semibold mb-2">
                {qIndex + 1}. {question.text}
              </p>
              <div className="space-y-1">
                {questionChoices.map((choice) => (
                  <label key={choice.id} className="block">
                    <input type="radio" name={`q_${question.id}`} value={choice.id} required />{' '}
                    {choice.text}
                  </label>
                ))}
              </div>
            </div>
          )
        })}
        <button type="submit" className="bg-black text-white px-4 py-2">
          제출하기
        </button>
      </form>
    </main>
  )
}
