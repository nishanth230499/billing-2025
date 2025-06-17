import { headers } from 'next/headers'

import { verifySession } from './session'

export function withAuth(action) {
  return async function (...args) {
    await verifySession()
    const loggedinUser = (await headers()).get('x-loggedin-user') || {}
    return await action(loggedinUser, ...args)
  }
}
