'use server'

import { redirect } from 'next/navigation'
import { setSession, type Role } from '@/lib/session'

export async function startSession(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const role = String(formData.get('role') ?? '') as Role

  if (!name || (role !== 'creator' && role !== 'taker')) {
    redirect('/?error=1')
  }

  await setSession({ name, role })

  if (role === 'creator') {
    redirect('/create')
  } else {
    redirect('/quizzes')
  }
}
