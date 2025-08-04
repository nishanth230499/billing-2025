'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'

import { getHsnAction, getHsnsAction } from '@/actions/hsnActions'
import handleServerAction from '@/lib/handleServerAction'

import AutoComplete from '../AutoComplete'
import ErrorAlert from '../ErrorAlert'

export default function HsnSelector({
  selectedHsnId,
  setSelectedHsnId,
  required,
  error,
}) {
  const [inputValue, setInputValue] = useState('')
  const [searchText] = useDebounce(inputValue, 1000)

  const {
    data: hsnsResponse,
    isLoading: isHsnsLoading,
    isError: isHsnsError,
    error: hsnsError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getHsnsAction, { searchText }),
    queryKey: ['getHsnsAction', searchText],
  })

  const {
    data: hsnResponse,
    isLoading: isHsnLoading,
    isError: isHsnError,
    error: hsnError,
  } = useQuery({
    queryFn: async () => await handleServerAction(getHsnAction, selectedHsnId),
    queryKey: ['getHsnAction', selectedHsnId],
    enabled: Boolean(selectedHsnId),
  })

  return (
    <ErrorAlert isError={isHsnsError} error={hsnsError}>
      <ErrorAlert isError={isHsnError} error={hsnError}>
        <AutoComplete
          error={error}
          required={required}
          loading={isHsnsLoading || isHsnLoading}
          inputValue={inputValue}
          setInputValue={setInputValue}
          selectedKey={selectedHsnId}
          selectedLabel={hsnResponse?._id ?? ''}
          setSelectedKey={setSelectedHsnId}
          options={
            hsnsResponse?.paginatedResults?.map((hsn) => ({
              key: hsn?._id,
              label: hsn?._id,
            })) || []
          }
          placeholder='Search for HSNs'
          noOptionsText='No HSN Found'
        />
      </ErrorAlert>
    </ErrorAlert>
  )
}
