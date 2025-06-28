'use client'

import { Autocomplete, TextField } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import { modelConstants } from '@/models/constants'

export default function CollectionSelector({
  selectedCollectionName,
  setSelectedCollectionName,
}) {
  const selectedModelName = useMemo(
    () => modelConstants?.[selectedCollectionName]?.modelName ?? '',
    [selectedCollectionName]
  )

  const [inputValue, setInputValue] = useState(selectedModelName)
  useEffect(() => {
    setInputValue(selectedModelName)
  }, [selectedModelName])
  return (
    <Autocomplete
      inputValue={inputValue ?? ''}
      onInputChange={(_, val, reason) => {
        if (reason === 'input') setInputValue(val)
        if (reason === 'blur') setInputValue(selectedModelName)
      }}
      value={selectedCollectionName}
      onChange={(_, option) => {
        setSelectedCollectionName(option?.key)
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
