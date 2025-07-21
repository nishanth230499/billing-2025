'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import getFirmsAction from '@/actions/firmActions'
import handleServerAction from '@/lib/handleServerAction'

import AutoComplete from '../AutoComplete'
import ErrorAlert from '../ErrorAlert'

export default function FirmSelector({
  selectedFirmId,
  setSelectedFirmId,
  error,
  required,
}) {
  const [inputValue, setInputValue] = useState('')

  const {
    data: firmsResponse,
    isLoading: isFirmsLoading,
    isError: isFirmsError,
    error: firmsError,
  } = useQuery({
    queryFn: async () => await handleServerAction(getFirmsAction),
    queryKey: ['getFirmsAction'],
  })

  const selectedLabel = useMemo(
    () => firmsResponse?.find(({ _id }) => _id === selectedFirmId)?.name ?? '',
    [firmsResponse, selectedFirmId]
  )

  return (
    <ErrorAlert isError={isFirmsError} error={firmsError}>
      <AutoComplete
        error={error}
        required={required}
        loading={isFirmsLoading}
        inputValue={inputValue}
        setInputValue={setInputValue}
        selectedKey={selectedFirmId}
        selectedLabel={selectedLabel}
        setSelectedKey={setSelectedFirmId}
        options={
          firmsResponse?.map(({ _id, name }) => ({
            key: _id,
            label: name,
          })) || []
        }
        placeholder='Search for Firms'
        noOptionsText='No Firms Found'
      />
    </ErrorAlert>
  )
}
