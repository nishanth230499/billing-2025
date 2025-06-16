'use server'

import { headers } from 'next/headers'

export default async function getURLWithSearchParams(searchParams, newParams) {
  const headersList = await headers()
  const pathname = headersList.get('x-current-path')

  const params = new URLSearchParams(searchParams)
  Object.entries(newParams).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
  })

  return `${pathname}?${params.toString()}`
}
