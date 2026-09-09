import Link from 'next/link'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { quizzes } from '@/db/schema'
import { getSession } from '@/lib/session'

export default async function QuizzesPage() {
  const session = await getSession()
  if (!session || session.role !== 'taker') redirect('/')

  const db = getDb()
  const publishedQuizzes = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.published, true))
    .orderBy(quizzes.createdAt)

  return (
    <main className="max-w-xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-4">풀 수 있는 퀴즈</h1>
      <ul className="space-y-2">
        {publishedQuizzes.map((quiz) => (
          <li key={quiz.id} className="border p-3 flex justify-between items-center">
            <span>
              {quiz.title} ({quiz.creatorName})
            </span>
            <Link href={`/quizzes/${quiz.id}`} className="underline">
              풀기
            </Link>
          </li>
        ))}
        {publishedQuizzes.length === 0 && <p>아직 게시된 퀴즈가 없습니다.</p>}
      </ul>
    </main>
  )
}
