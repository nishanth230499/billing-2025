'use client'

import React, { useCallback, useState } from 'react'

import SplitPanel from '@/components/common/SplitPanel/SplitPanel'

import SearchedItemPanel from './SearchedItemPanel'
import SelectedItemsPanel from './SelectedItemsPanel'

export default function Page() {
  const [selectedItems, setSelectedItems] = useState({})
  const [selectedItemsOrder, setSelectedItemsOrder] = useState([])

  const handleAddItem = useCallback((item) => {
    // TODO: Doesnot work in mobile. Use npm uuid
    const selectedItemKey = crypto.randomUUID()
    setSelectedItems((items) => ({
      ...items,
      [selectedItemKey]: { ...item },
    }))
    setSelectedItemsOrder((itemKeys) => [...itemKeys, selectedItemKey])
  }, [])

  return (
    <>
      <SplitPanel>
        <SelectedItemsPanel
          key='selectedItemsPanel'
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          selectedItemsOrder={selectedItemsOrder}
          setSelectedItemsOrder={setSelectedItemsOrder}
        />
        <SearchedItemPanel
          key='searchedItemPanel'
          handleAddItem={handleAddItem}
        />
      </SplitPanel>
    </>
  )
}
