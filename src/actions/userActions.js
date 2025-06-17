import { DEFAULT_PAGE_SIZE } from '@/constants'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { withAuth } from '@/lib/withAuth'
import User from '@/models/User'

import { getLoggedinUserAction } from './authActions'

async function getUsers(_, pageNumber = 0, pageSize = DEFAULT_PAGE_SIZE) {
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
  return users
}

export const getUsersAction = withAuth(getUsers)
