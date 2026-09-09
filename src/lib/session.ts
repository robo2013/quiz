import { cookies } from 'next/headers'

export type Role = 'creator' | 'taker'

export type Session = {
  name: string
  role: Role
}

const COOKIE_NAME = 'quiz_session'

export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const raw = store.get(COOKIE_NAME)?.value
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (parsed.name && (parsed.role === 'creator' || parsed.role === 'taker')) {
      return parsed as Session
    }
    return null
  } catch {
    return null
  }
}

export async function setSession(session: Session): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
}
