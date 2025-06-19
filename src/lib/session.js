'use server'

import { jwtVerify, SignJWT } from 'jose'
import { cookies, headers } from 'next/headers'

import User from '@/models/User'

import connectDB from './connectDB'
import getLoggedinUserId from './getLoggedinUserId'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function createSession(
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

export async function verifySession() {
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

export async function isSessionActive() {
  await connectDB()
  const loggedinAt = parseInt((await headers()).get('x-loggedin-at'))
  const loggedinUserId = await getLoggedinUserId()
  const loggedinUser = await User.findOne(
    { _id: loggedinUserId },
    { hashedPassword: 0 }
  )
  if (!loggedinUser.active) {
    throw new Error('User is not active! Contact admin!')
  }

  if (Number.isNaN(loggedinAt) || loggedinUser.passwordChangedAt > loggedinAt) {
    throw new Error(
      'Password has been changed! Please re-login with your new password!'
    )
  }
  // TODO: Check if password needs to be changed
  return loggedinUser
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
