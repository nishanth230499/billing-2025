'use client'

import { useCallback, useMemo } from 'react'

import { DEFAULT_PAGE_SIZE } from '@/constants'

import useHandleSearchParams from './useHandleSearchParams'

export default function usePaginationControl(
  pageNumberSearchParamName: string = 'pageNumber',
  pageSizeSearchParamName: string = 'pageSize'
) {
  const { getURL, searchParams } = useHandleSearchParams()

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
      window.history.replaceState(
        {},
        '',
        getURL({ [pageNumberSearchParamName]: page.toString() })
      )
    },
    [getURL, pageNumberSearchParamName]
  )

  const setPageSize = useCallback(
    (size: number) => {
      window.history.replaceState(
        {},
        '',
        getURL({
          [pageSizeSearchParamName]: size.toString(),
          [pageNumberSearchParamName]: '0',
        })
      )
    },
    [getURL, pageNumberSearchParamName, pageSizeSearchParamName]
  )

  return { pageNumber, setPageNumber, pageSize, setPageSize }
}
