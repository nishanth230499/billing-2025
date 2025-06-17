'use client'

import { SOMETHING_WENT_WRONG } from '@/constants'
import { useCallback, useState } from 'react'

export default function useServerAction(action) {
  // TODO: loading fails if multiple requests are sent simultaneously.
  const [isLoading, setIsLoading] = useState(false)
  const newAction = useCallback(
    async (...params) => {
      setIsLoading(true)
      try {
        const res = await action(...params)
        setIsLoading(false)
        return res
      } catch (e) {
        setIsLoading(false)
        if (e.digest)
          return {
            success: false,
            errors: [`${SOMETHING_WENT_WRONG} Digest: ${e.digest}`],
          }
        return { success: false, errors: [e.toString()] }
      }
    },
    [action]
  )

  return [newAction, isLoading]
}
