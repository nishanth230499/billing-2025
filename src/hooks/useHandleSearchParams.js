'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function useHandleSearchParams() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const generateURL = useCallback(
    (newParams) => {
      const params = new URLSearchParams(searchParams)
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      return `${pathname}?${params.toString()}`
    },
    [pathname, searchParams]
  )

  return { searchParams, getURL: generateURL }
}
