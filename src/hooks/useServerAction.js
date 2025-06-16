'use client'

import { useCallback, useState } from 'react'

export default function useServerAction(action) {
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
        return { success: false, errors: [e] }
      }
    },
    [action]
  )

  return [newAction, isLoading]
}
