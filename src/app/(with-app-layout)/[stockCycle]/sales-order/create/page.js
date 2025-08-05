'use client'

import { Box, Grid, Paper, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useEffect, useState } from 'react'

import { getItemsAction } from '@/actions/itemsActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import SearchBar from '@/components/common/SearchBar'
import CompanySelector from '@/components/common/selectors/CompanySelector'
import SplitPanel from '@/components/common/SplitPanel/SplitPanel'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import handleServerAction from '@/lib/handleServerAction'
import { numberRegex } from '@/lib/regex'

const itemTableColumns = {
  _id: { label: 'ID' },
  companyShortName: {
    label: 'Company Short Name',
    format: (item) => item?.company?.shortName,
  },
  name: { label: 'Name' },
  group: { label: 'Group', editable: true, nextColumnKey: 'quantity' },
  quantity: {
    label: 'Quantity',
    editable: true,
    previousColumnKey: 'group',
    nextColumnKey: 'unitQuantity',
    validator: (item) => !item?.quantity || numberRegex.test(item?.quantity),
  },
  unitQuantity: {
    label: 'Unit Quantity',
    editable: true,
    previousColumnKey: 'quantity',
    validator: (item) =>
      !item?.unitQuantity || numberRegex.test(item?.unitQuantity),
  },
  actions: {
    label: 'Actions',
    // component: ItemTableActions,
    slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  },
}

const selectedItemTableColumns = {
  _id: { label: 'ID' },
  companyShortName: {
    label: 'Company Short Name',
    format: (item) => item?.company?.shortName,
  },
  name: { label: 'Name' },
  group: { label: 'Group', editable: true, nextColumnKey: 'quantity' },
  quantity: {
    label: 'Quantity',
    editable: true,
    previousColumnKey: 'group',
    nextColumnKey: 'unitQuantity',
    validator: (item) => numberRegex.test(item?.quantity),
  },
  unitQuantity: {
    label: 'Unit Quantity',
    editable: true,
    previousColumnKey: 'quantity',
    validator: (item) => numberRegex.test(item?.unitQuantity),
  },
  actions: {
    label: 'Actions',
    // component: ItemTableActions,
    slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  },
}

export default function Page() {
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [searchText, setSearchText] = useState('')
  const [pageNumber, setPageNumber] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [searchedItems, setSearchedItems] = useState({})
  const [selectedItems, setSelectedItems] = useState({})
  const [selectedItemsOrder, setSelectedItemsOrder] = useState([])

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size)
    setPageNumber(0)
  }, [])

  const {
    data: itemsResponse,
    isLoading: isItemsLoading,
    isError: isItemsError,
    error: itemsError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getItemsAction, {
        pageNumber,
        pageSize,
        companyId: selectedCompanyId,
        searchText,
        sortFields: searchText ? {} : { _id: 1 },
      }),
    queryKey: [
      'getItemsAction',
      pageNumber,
      pageSize,
      selectedCompanyId,
      searchText,
    ],
  })

  useEffect(() => {
    setSearchedItems(
      Object.fromEntries(
        itemsResponse?.paginatedResults?.map((item) => [item?._id, item]) || []
      )
    )
  }, [itemsResponse?.paginatedResults])

  const handleAddItem = useCallback(
    (itemKey) => {
      // TODO: Doesnot work in mobile. Use npm uuid
      const selectedItemKey = crypto.randomUUID()
      setSelectedItems((items) => ({
        ...items,
        [selectedItemKey]: { ...searchedItems[itemKey] },
      }))
      setSelectedItemsOrder((itemKeys) => [...itemKeys, selectedItemKey])
    },
    [searchedItems]
  )

  return (
    <>
      <Typography className='mb-4' variant='h6'>
        Create New Order
      </Typography>
      <SplitPanel direction='vertical'>
        <Box key='123' className='h-full flex flex-col p-4' component={Paper}>
          <DataTable
            columns={selectedItemTableColumns}
            data={selectedItems}
            dataOrder={selectedItemsOrder}
            onDataChange={setSelectedItems}
            onDataOrderChange={setSelectedItemsOrder}
            className='grow'
          />
        </Box>
        <Box key='456' className='h-full flex flex-col p-4' component={Paper}>
          <Grid container columnSpacing={2} columns={3} className='mb-2'>
            <Grid size={{ xs: 3, sm: 1 }}>
              <CompanySelector
                selectedCompanyId={selectedCompanyId}
                setSelectedCompanyId={setSelectedCompanyId}
              />
            </Grid>
            <Grid size={{ xs: 3, sm: 2 }}>
              <SearchBar
                label='Search for Items'
                searchText={searchText}
                setSearchText={setSearchText}
              />
            </Grid>
          </Grid>
          <Box className='mb-4'></Box>
          {isItemsLoading && <TableSkeleton />}
          <ErrorAlert isError={isItemsError} error={itemsError}>
            <DataTable
              hidden={isItemsLoading}
              columns={itemTableColumns}
              data={searchedItems}
              dataOrder={Object.keys(searchedItems)}
              onDataChange={setSearchedItems}
              onEnterPress={handleAddItem}
              paginationProps={{
                pageNumber,
                setPageNumber,
                pageSize,
                setPageSize: handlePageSizeChange,
                totalCount: itemsResponse?.totalCount,
              }}
              className='grow flex flex-col justify-between'
            />
          </ErrorAlert>
        </Box>
      </SplitPanel>
    </>
  )
}
