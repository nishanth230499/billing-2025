'use client'

import { useMemo, useState } from 'react'

import { modelConstants } from '@/models/constants'

import AutoComplete from '../AutoComplete'

export default function CollectionSelector({
  selectedCollectionName,
  setSelectedCollectionName,
}) {
  const selectedModelName = useMemo(
    () => modelConstants?.[selectedCollectionName]?.modelName ?? '',
    [selectedCollectionName]
  )

  const [inputValue, setInputValue] = useState(selectedModelName)

  return (
    <AutoComplete
      inputValue={inputValue}
      setInputValue={setInputValue}
      selectedKey={selectedCollectionName}
      selectedLabel={selectedModelName}
      setSelectedKey={setSelectedCollectionName}
      options={Object.values(modelConstants).map((model) => ({
        key: model?.collectionName,
        label: model?.modelName,
      }))}
      autoFilterOptions
      placeholder='Search for Collections'
      noOptionsText='No Collections Found'
    />
  )
}
