'use server'

import { headers } from 'next/headers'

import User from '@/models/User'

import connectDB from '../connectDB'
import getLoggedinUserId from '../getLoggedinUserId'

export default async function isSessionActive() {
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
  // TODO: Build change password logic and uncomment this
  // if (loggedinUser?.changePasswordRequired) {
  //   throw new Error('Password change is required. Please change your password!')
  // }
  return loggedinUser
}
