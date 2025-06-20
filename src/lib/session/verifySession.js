'use server'

import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export default async function verifySession() {
  try {
    const cookieStore = await cookies()

    try {
      const accessToken = cookieStore.get('accessToken')?.value
      const { userId, loggedinAt } = await decrypt(accessToken)
      return { userId, verifyType: 'accessToken', loggedinAt }
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      const refreshToken = cookieStore.get('refreshToken')?.value
      const { userId, loggedinAt } = await decrypt(refreshToken)
      return { userId, verifyType: 'refreshToken', loggedinAt }
    }
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    throw new Error('Not Authenticated! Please login!')
  }
}

async function decrypt(jwtToken) {
  const { payload } = await jwtVerify(jwtToken, encodedKey, {
    algorithms: ['HS256'],
  })
  return payload
}
