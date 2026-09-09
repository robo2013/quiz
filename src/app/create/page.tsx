import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { quizzes } from '@/db/schema'
import { getSession } from '@/lib/session'
import { createQuiz } from './actions'

export default async function CreatePage() {
  const session = await getSession()
  if (!session || session.role !== 'creator') {
    redirect('/')
  }

  const db = getDb()
  const myQuizzes = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.creatorName, session.name))
    .orderBy(quizzes.createdAt)

  return (
    <main className="max-w-xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-4">{session.name}님의 퀴즈</h1>

      <form action={createQuiz} className="mb-8 flex gap-2">
        <input
          name="title"
          placeholder="새 퀴즈 제목"
          required
          className="border px-3 py-2 flex-1"
        />
        <button type="submit" className="bg-black text-white px-4 py-2">
          새 퀴즈 만들기
        </button>
      </form>

      <ul className="space-y-2">
        {myQuizzes.map((quiz) => (
          <li key={quiz.id} className="border p-3 flex justify-between items-center">
            <span>
              {quiz.title} {quiz.published ? '✅ 게시됨' : '📝 작성 중'}
            </span>
            <Link href={`/create/${quiz.id}`} className="underline">
              편집
            </Link>
          </li>
        ))}
        {myQuizzes.length === 0 && <p>아직 만든 퀴즈가 없습니다.</p>}
      </ul>
    </main>
  )
}
