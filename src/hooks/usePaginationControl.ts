'use client'

import { useCallback, useMemo } from 'react'

import { DEFAULT_PAGE_SIZE } from '@/constants'

import useHandleSearchParams from './useHandleSearchParams'

export default function usePaginationControl(
  pageNumberSearchParamName: string = 'pageNumber',
  pageSizeSearchParamName: string = 'pageSize'
) {
  const { replaceURL, searchParams } = useHandleSearchParams()

  const pageNumber = useMemo(
    () => Number(searchParams.get(pageNumberSearchParamName)) || 0,
    [pageNumberSearchParamName, searchParams]
  )
  const pageSize = useMemo(
    () =>
      Number(searchParams.get(pageSizeSearchParamName)) || DEFAULT_PAGE_SIZE,
    [pageSizeSearchParamName, searchParams]
  )

  const setPageNumber = useCallback(
    (page: number) => {
      replaceURL({ [pageNumberSearchParamName]: page.toString() })
    },
    [replaceURL, pageNumberSearchParamName]
  )

  const setPageSize = useCallback(
    (size: number) => {
      replaceURL({
        [pageSizeSearchParamName]: size.toString(),
        [pageNumberSearchParamName]: '0',
      })
    },
    [replaceURL, pageNumberSearchParamName, pageSizeSearchParamName]
  )

  return { pageNumber, setPageNumber, pageSize, setPageSize }
}
