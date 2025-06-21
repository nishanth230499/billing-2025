'use client'

import { CONTACT_ADMIN, SOMETHING_WENT_WRONG } from '@/constants'

export default async function handleServerAction(action, ...params) {
  try {
    const res = await action(...params)
    if (res?.success) {
      return res?.data
    } else if (res?.success === false) {
      throw new Error(res?.error)
    } else {
      return res
    }
  } catch (e) {
    if (e.digest) {
      throw new Error(
        `${SOMETHING_WENT_WRONG} ${CONTACT_ADMIN} Digest:${e.digest}`
      )
    } else throw e
  }
}
