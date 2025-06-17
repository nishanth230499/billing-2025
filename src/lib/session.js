'use server'

import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function createSession(cookieStore, userId) {
  const accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
  const refreshTokenExpiresAt = new Date(
    Date.now() + 2 * 7 * 24 * 60 * 60 * 1000
  )
  const accessToken = await encrypt({
    userId,
    expiresAt: accessTokenExpiresAt,
    type: 'access',
  })
  const refreshToken = await encrypt({
    userId,
    expiresAt: refreshTokenExpiresAt,
    type: 'refresh',
  })

  cookieStore.set('accessToken', accessToken, {
    httpOnly: process.env.NODE_ENV !== 'development',
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    expires: accessTokenExpiresAt,
  })
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: process.env.NODE_ENV !== 'development',
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    expires: refreshTokenExpiresAt,
  })
}

export async function verifySession() {
  const cookieStore = await cookies()

  try {
    const accessToken = cookieStore.get('accessToken')?.value
    const { userId } = await decrypt(accessToken)
    return { userId, verifyType: 'accessToken' }
  } catch (e) {
    const refreshToken = cookieStore.get('refreshToken')?.value
    const { userId } = await decrypt(refreshToken)
    return { userId, verifyType: 'refreshToken' }
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
}

export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(jwtToken) {
  const { payload } = await jwtVerify(jwtToken, encodedKey, {
    algorithms: ['HS256'],
  })
  return payload
}
