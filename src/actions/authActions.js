'use server'

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

import connectDB from '@/lib/connectDB'
import createSession from '@/lib/session/createSession'
import deleteSession from '@/lib/session/deleteSession'
import { withAuth } from '@/lib/withAuth'
import User from '@/models/User'

export async function loginAction(req) {
  await connectDB()

  const { email, password } = req

  const user = await User.findOne({ emailId: email })
  if (user) {
    const match = await bcrypt.compare(password, user.hashedPassword)
    if (match) {
      if (!user?.active) {
        return {
          success: false,
          error: 'User is not active! Contact admin!',
        }
      }
      const cookieStore = await cookies()

      await createSession(cookieStore, user?._id?.toString())
      return {
        success: true,
        data: 'Login Successful!',
      }
    }
  }
  return {
    success: false,
    error: 'Invalid email or password!',
  }
}

export async function logoutAction() {
  await deleteSession()
  return {
    success: true,
    data: 'Logout Successful!',
  }
}

async function getLoggedinUser(loggedinUser) {
  return { success: true, data: loggedinUser }
}

export const getLoggedinUserAction = withAuth(getLoggedinUser)
