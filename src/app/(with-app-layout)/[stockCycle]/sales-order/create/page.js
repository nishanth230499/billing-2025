'use client'

import React, { useCallback, useState } from 'react'
import { v4 as uuid } from 'uuid'

import SplitPanel from '@/components/common/SplitPanel/SplitPanel'

import SearchedItemPanel from './SearchedItemPanel'
import SelectedItemsPanel from './SelectedItemsPanel'

export default function Page() {
  const [selectedItems, setSelectedItems] = useState({})
  const [selectedItemsOrder, setSelectedItemsOrder] = useState([])
  const [addBeforeKey, setAddBeforeKey] = useState()

  const handleAddItem = useCallback(
    (item) => {
      const selectedItemKey = uuid()
      setSelectedItems((items) => ({
        ...items,
        [selectedItemKey]: { ...item },
      }))

      setSelectedItemsOrder((itemKeys) => {
        const indexToInsertBefore = itemKeys.indexOf(addBeforeKey)
        if (indexToInsertBefore !== -1) {
          const newArray = [...itemKeys]
          newArray.splice(indexToInsertBefore, 0, selectedItemKey)
          return newArray
        } else {
          return [...itemKeys, selectedItemKey]
        }
      })
    },
    [addBeforeKey]
  )

  return (
    <>
      <SplitPanel>
        <SelectedItemsPanel
          key='selectedItemsPanel'
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          selectedItemsOrder={selectedItemsOrder}
          setSelectedItemsOrder={setSelectedItemsOrder}
          addBeforeKey={addBeforeKey}
          setAddBeforeKey={setAddBeforeKey}
        />
        <SearchedItemPanel
          key='searchedItemPanel'
          handleAddItem={handleAddItem}
        />
      </SplitPanel>
    </>
  )
}
