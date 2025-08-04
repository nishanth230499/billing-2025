'use client'

import { useCallback, useMemo } from 'react'

import useHandleSearchParams from './useHandleSearchParams'

export default function useModalControl(
  searchParamName: string,
  additionalSearchParamNames: string[] = []
) {
  const { replaceURL, searchParams } = useHandleSearchParams()

  const setModalValue = useCallback(
    (searchParamValue: string) => {
      replaceURL({ [searchParamName]: searchParamValue })
    },
    [replaceURL, searchParamName]
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
    replaceURL({
      [searchParamName]: null,
      ...Object.fromEntries(
        additionalSearchParamNames.map((name) => [name, null])
      ),
    })
  }, [additionalSearchParamNames, replaceURL, searchParamName])

  return { setModalValue, modalValue, additionalModalValues, handleCloseModal }
}
