'use client'

import { Autocomplete, TextField } from '@mui/material'
import { useMemo, useState } from 'react'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import { modelConstants } from '@/models/constants'

export default function UserSelector() {
  const { getURL, searchParams } = useHandleSearchParams()

  const collectionName = useMemo(
    () => searchParams.get('collectionName') ?? '',
    [searchParams]
  )

  const selectedModelName = useMemo(
    () => modelConstants?.[collectionName]?.modelName ?? '',
    [collectionName]
  )

  const [inputValue, setInputValue] = useState(selectedModelName ?? '')

  return (
    <Autocomplete
      inputValue={inputValue ?? ''}
      onInputChange={(_, val, reason) => {
        if (reason === 'input') setInputValue(val)
        if (reason === 'blur') setInputValue(selectedModelName)
      }}
      value={collectionName}
      onChange={(_, option) => {
        window.history.replaceState(
          {},
          '',
          getURL({ collectionName: option?.key })
        )
        setInputValue(option?.label)
      }}
      options={
        Object.values(modelConstants)?.map((model) => ({
          key: model?.collectionName,
          label: model?.modelName,
        })) || []
      }
      getOptionKey={(option) => option?.key}
      renderInput={({ ...params }) => (
        <TextField {...params} label='Search for Collections' />
      )}
      isOptionEqualToValue={(option, value) => option?.key === value}
      noOptionsText='No Collections Found'
    />
  )
}
