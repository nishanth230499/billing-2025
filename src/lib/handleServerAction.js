'use client'

export default async function handleServerAction(action, ...params) {
  const res = await action(...params)
  if (res?.success) {
    return res?.data
  } else if (res?.success === false) {
    throw new Error(res?.error)
  } else {
    return res
  }
}
