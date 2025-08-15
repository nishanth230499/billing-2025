'use client'

import { useParams } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { v4 as uuid } from 'uuid'

import SplitPanel from '@/components/common/SplitPanel/SplitPanel'

import SearchedItemPanel from '../../create/SearchedItemPanel'
import SelectedItemsPanel from '../../create/SelectedItemsPanel'

export default function Page() {
  const params = useParams()

  const editingSalesOrderNumber = params.salesOrderNumber

  const [selectedItems, setSelectedItems] = useState({})
  const [selectedItemsOrder, setSelectedItemsOrder] = useState([])

  const handleAddItem = useCallback((item) => {
    const selectedItemKey = uuid()
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
          editingSalesOrderNumber={editingSalesOrderNumber}
        />
        <SearchedItemPanel
          key='searchedItemPanel'
          handleAddItem={handleAddItem}
        />
      </SplitPanel>
    </>
  )
}
