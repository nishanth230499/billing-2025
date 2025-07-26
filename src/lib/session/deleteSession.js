'use server'

import { cookies } from 'next/headers'

export default async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
}
