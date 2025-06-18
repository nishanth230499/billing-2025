'use client'

import { useCallback, useState } from 'react'

import { SOMETHING_WENT_WRONG } from '@/constants'

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
            message: `${SOMETHING_WENT_WRONG} Digest: ${e.digest}`,
          }
        return { success: false, message: e.toString() }
      }
    },
    [action]
  )

  return [newAction, isLoading]
}
