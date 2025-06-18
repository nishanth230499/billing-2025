import { verifySession } from './session'

export function withAuth(action) {
  return async function (...args) {
    await verifySession()
    return await action(...args)
  }
}
