'use server'

import { z } from 'zod'
import { createSession, deleteSession } from '@/lib/session'
import { emailSchema, loginPasswordSchema } from '@/lib/schemas'
import { cookies, headers } from 'next/headers'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/connectDB'

const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
})

export async function loginAction(req) {
  await connectDB()

  const result = loginSchema.safeParse(req)
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues,
    }
  }

  const { email, password } = result.data

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
  throw new Error('Invalid email or password')
  return {
    success: false,
    errors: [{ message: 'Invalid email or password!' }],
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
