import { startSession } from './actions'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <main className="max-w-sm mx-auto mt-24 p-6">
      <h1 className="text-2xl font-bold mb-6">퀴즈 프로그램</h1>
      <form action={startSession} className="space-y-4">
        <div>
          <label className="block mb-1">이름</label>
          <input name="name" required className="border px-3 py-2 w-full" />
        </div>
        <div>
          <p className="mb-1">역할을 선택하세요</p>
          <label className="block">
            <input type="radio" name="role" value="creator" required /> 출제자로 입장
          </label>
          <label className="block">
            <input type="radio" name="role" value="taker" /> 수검자로 입장
          </label>
        </div>
        {params.error && (
          <p className="text-red-600 text-sm">이름과 역할을 모두 입력해주세요.</p>
        )}
        <button type="submit" className="bg-black text-white px-4 py-2 w-full">
          시작하기
        </button>
      </form>
    </main>
  )
}
