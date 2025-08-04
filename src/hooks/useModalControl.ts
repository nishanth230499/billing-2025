'use client'

import { useCallback, useMemo } from 'react'

import useHandleSearchParams from './useHandleSearchParams'

export default function useModalControl(
  searchParamName: string,
  additionalSearchParamNames: string[] = []
) {
  const { getURL, searchParams } = useHandleSearchParams()

  const setModalValue = useCallback(
    (searchParamValue: string) => {
      window.history.replaceState(
        {},
        '',
        getURL({ [searchParamName]: searchParamValue })
      )
    },
    [getURL, searchParamName]
  )

  const additionalModalValues = useMemo(() => {
    const res: { [s: string]: string | null } = {}
    additionalSearchParamNames.forEach((name) => {
      res[name] = searchParams.get(name)
    })
    return res
  }, [additionalSearchParamNames, searchParams])

  const modalValue = useMemo(
    () => searchParams.get(searchParamName),
    [searchParamName, searchParams]
  )

  const handleCloseModal = useCallback(() => {
    window.history.replaceState(
      {},
      '',
      getURL({
        [searchParamName]: null,
        ...Object.fromEntries(
          additionalSearchParamNames.map((name) => [name, null])
        ),
      })
    )
  }, [additionalSearchParamNames, getURL, searchParamName])

  return { setModalValue, modalValue, additionalModalValues, handleCloseModal }
}
