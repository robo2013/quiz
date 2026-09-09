import { redirect } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { quizzes, questions, choices } from '@/db/schema'
import { getSession } from '@/lib/session'
import {
  addQuestion,
  deleteQuestion,
  addChoice,
  deleteChoice,
  setCorrectChoice,
  publishQuiz,
} from './actions'

export default async function EditQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { quizId } = await params
  const { error } = await searchParams

  const session = await getSession()
  if (!session || session.role !== 'creator') redirect('/')

  const db = getDb()
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId))
  if (!quiz || quiz.creatorName !== session.name) redirect('/create')

  const questionRows = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quizId))
    .orderBy(questions.order)

  const questionIds = questionRows.map((q) => q.id)
  const choiceRows = questionIds.length
    ? await db.select().from(choices).where(inArray(choices.questionId, questionIds))
    : []

  const addQuestionWithId = addQuestion.bind(null, quizId)
  const publishWithId = publishQuiz.bind(null, quizId)

  return (
    <main className="max-w-2xl mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold mb-1">{quiz.title}</h1>
      <p className="mb-6">{quiz.published ? '✅ 게시됨' : '📝 작성 중'}</p>

      {error === 'need-question' && (
        <p className="text-red-600 mb-4">문제를 1개 이상 추가해주세요.</p>
      )}
      {error === 'invalid-question' && (
        <p className="text-red-600 mb-4">
          모든 문제는 보기 2개 이상, 정답 1개가 설정되어야 합니다.
        </p>
      )}

      <div className="space-y-6 mb-8">
        {questionRows.map((question, qIndex) => {
          const questionChoices = choiceRows.filter((c) => c.questionId === question.id)
          const addChoiceWithIds = addChoice.bind(null, quizId, question.id)
          const deleteQuestionWithIds = deleteQuestion.bind(null, quizId, question.id)

          return (
            <div key={question.id} className="border p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold">
                  {qIndex + 1}. {question.text}
                </p>
                <form action={deleteQuestionWithIds}>
                  <button type="submit" className="text-red-600 text-sm">
                    문제 삭제
                  </button>
                </form>
              </div>

              <ul className="space-y-1 mb-3">
                {questionChoices.map((choice) => {
                  const setCorrectWithIds = setCorrectChoice.bind(
                    null,
                    quizId,
                    question.id,
                    choice.id
                  )
                  const deleteChoiceWithIds = deleteChoice.bind(null, quizId, choice.id)
                  return (
                    <li key={choice.id} className="flex items-center gap-2">
                      <form action={setCorrectWithIds}>
                        <button
                          type="submit"
                          className={choice.isCorrect ? 'font-bold text-green-700' : ''}
                        >
                          {choice.isCorrect ? '✅' : '⬜'} {choice.text}
                        </button>
                      </form>
                      <form action={deleteChoiceWithIds}>
                        <button type="submit" className="text-red-600 text-xs">
                          삭제
                        </button>
                      </form>
                    </li>
                  )
                })}
              </ul>

              <form action={addChoiceWithIds} className="flex gap-2">
                <input
                  name="text"
                  placeholder="보기 추가"
                  required
                  className="border px-2 py-1 flex-1 text-sm"
                />
                <button type="submit" className="border px-2 py-1 text-sm">
                  추가
                </button>
              </form>
            </div>
          )
        })}
      </div>

      <form action={addQuestionWithId} className="flex gap-2 mb-8">
        <input name="text" placeholder="새 문제" required className="border px-3 py-2 flex-1" />
        <button type="submit" className="bg-black text-white px-4 py-2">
          문제 추가
        </button>
      </form>

      <form action={publishWithId}>
        <button type="submit" className="bg-green-700 text-white px-4 py-2">
          퀴즈 게시하기
        </button>
      </form>
    </main>
  )
}
