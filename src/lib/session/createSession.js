'use server'

import { SignJWT } from 'jose'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export default async function createSession(
  cookieStore,
  userId,
  loggedinAt = Date.now()
) {
  const currentTime = Date.now()
  // TODO: Use time delta from env
  const accessTokenExpiresAt = new Date(currentTime + 60 * 60 * 1000)
  const refreshTokenExpiresAt = new Date(
    currentTime + 2 * 7 * 24 * 60 * 60 * 1000
  )
  const accessToken = await encrypt({
    userId,
    loggedinAt,
    expiresAt: accessTokenExpiresAt,
    type: 'access',
  })
  const refreshToken = await encrypt({
    userId,
    loggedinAt,
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

export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}
