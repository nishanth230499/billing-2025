'use server'

import bcrypt from 'bcryptjs'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import { trackCreation, trackUpdates } from '@/lib/auditLogUtils'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { passwordRegex } from '@/lib/regex'
import { withAuth } from '@/lib/withAuth'
import User from '@/models/User'

import { getLoggedinUserAction } from './authActions'

async function getUsers(pageNumber = 0, pageSize = DEFAULT_PAGE_SIZE) {
  await connectDB()

  const loggedinUser = await getLoggedinUserAction()

  if (loggedinUser?.type !== 'Admin') {
    throw Error('Only admins can request for all users.')
  }

  const users = await getPaginatedData(User, {
    pageNumber,
    pageSize,
    project: { hashedPassword: 0 },
  })
  return { success: true, data: users }
}

async function getUser(userId) {
  await connectDB()

  const loggedinUser = await getLoggedinUserAction()

  if (loggedinUser?.type !== 'Admin') {
    throw Error('Only admins can request for users.')
  }

  const user = await User.findOne({ _id: userId }, { hashedPassword: 0 }).lean()
  if (user) {
    user._id = user._id.toString()
    return { success: true, data: user }
  }
  return { success: false, error: 'User not found!' }
}

async function createUser(userReq) {
  await connectDB()

  const loggedinUser = await getLoggedinUserAction()

  if (loggedinUser?.type !== 'Admin') {
    return {
      success: false,
      error: 'Only Admins can create users.',
    }
  }

  if (!passwordRegex.test(userReq?.password)) {
    return {
      success: false,
      error: 'Did not meet password requirements',
    }
  }

  const salt = await bcrypt.genSalt(10)
  try {
    const user = new User({
      emailId: userReq?.emailId,
      name: userReq?.name,
      hashedPassword: await bcrypt.hash(userReq?.password, salt),
      passwordChangedAt: new Date(),
      type: userReq?.type,
      active: userReq?.active,
    })
    await user.save()

    trackCreation({
      model: User,
      documentId: user._id,
      newDocument: user.toObject(),
    })
    return {
      success: true,
      data: 'User created successfully!',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
}

async function editUser(userId, userReq) {
  await connectDB()

  const loggedinUser = await getLoggedinUserAction()

  if (loggedinUser?.type !== 'Admin') {
    return {
      success: false,
      error: 'Only Admins can edit users.',
    }
  }

  const userUpdateFields = {
    name: userReq?.name,
    type: userReq?.type,
    active: userReq?.active,
  }

  const oldUser = await User.findOneAndUpdate(
    { _id: userId },
    userUpdateFields,
    {
      runValidators: true,
    }
  ).lean()

  trackUpdates({
    model: User,
    documentId: oldUser._id,
    oldDocument: oldUser,
    newDocument: userUpdateFields,
  })

  return {
    success: true,
    data: 'User updated successfully!',
  }
}

export const getUsersAction = withAuth(getUsers)
export const getUserAction = withAuth(getUser)
export const createUserAction = withAuth(createUser)
export const editUserAction = withAuth(editUser)
