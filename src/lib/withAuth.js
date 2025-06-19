import { isSessionActive, verifySession } from './session'

export function withAuth(action) {
  return async function (...args) {
    let loggedinUser
    try {
      await verifySession()
      loggedinUser = await isSessionActive()
    } catch (e) {
      return { success: false, error: e.message }
    }
    return await action(...args, loggedinUser)
  }
}
