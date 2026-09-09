import { redirect, notFound } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { quizzes, questions, choices } from '@/db/schema'
import { getSession } from '@/lib/session'

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { quizId } = await params
  const answers = await searchParams

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

  let correctCount = 0
  const rows = questionRows.map((question) => {
    const questionChoices = choiceRows.filter((c) => c.questionId === question.id)
    const correctChoice = questionChoices.find((c) => c.isCorrect)
    const selectedId = answers[`q_${question.id}`]
    const selectedChoice = questionChoices.find((c) => c.id === selectedId)
    const isCorrect = !!selectedChoice && selectedChoice.id === correctChoice?.id
    if (isCorrect) correctCount += 1

    return { question, correctChoice, selectedChoice, isCorrect }
  })

  return (
    <main className="max-w-xl mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold mb-2">{quiz.title} 결과</h1>
      <p className="text-xl mb-6">
        {correctCount} / {questionRows.length} 점
      </p>

      <div className="space-y-4">
        {rows.map(({ question, correctChoice, selectedChoice, isCorrect }, qIndex) => (
          <div key={question.id} className="border p-3">
            <p className="font-semibold mb-1">
              {qIndex + 1}. {question.text} {isCorrect ? '✅' : '❌'}
            </p>
            <p className="text-sm">내 답: {selectedChoice?.text ?? '(선택 안 함)'}</p>
            {!isCorrect && (
              <p className="text-sm text-green-700">정답: {correctChoice?.text}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
