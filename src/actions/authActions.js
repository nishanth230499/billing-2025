'use server'

import bcrypt from 'bcryptjs'
import { cookies, headers } from 'next/headers'

import connectDB from '@/lib/connectDB'
import { createSession, deleteSession } from '@/lib/session'
import User from '@/models/User'

export async function loginAction(req) {
  await connectDB()

  const { email, password } = req

  const user = await User.findOne({ emailId: email })

  if (user) {
    const match = await bcrypt.compare(password, user.hashedPassword)
    if (match) {
      const cookieStore = await cookies()

      await createSession(cookieStore, user?._id?.toString())
      return {
        success: true,
        message: 'Login Successful!',
      }
    }
  }
  return {
    success: false,
    message: 'Invalid email or password!',
  }
}

export async function logoutAction() {
  await deleteSession()
  return {
    success: true,
    message: 'Logout Successful!',
  }
}

export async function getLoggedinUserAction() {
  await connectDB()

  const userId = (await headers()).get('x-loggedin-user')
  const user = await User.findOne({ _id: userId }, { hashedPassword: 0 })
  user._id = user._id.toString()
  return user
}
