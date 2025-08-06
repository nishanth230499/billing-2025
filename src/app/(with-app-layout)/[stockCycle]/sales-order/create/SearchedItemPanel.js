import { Grid, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'

import { getItemsAction } from '@/actions/itemsActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import SearchBar from '@/components/common/SearchBar'
import CompanySelector from '@/components/common/selectors/CompanySelector'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import handleServerAction from '@/lib/handleServerAction'
import { numberRegex } from '@/lib/regex'

import SearchedItemTableActions from './SearchedItemTableActions'

export default function SearchedItemPanel({ handleAddItem }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [searchText, setSearchText] = useState('')
  const [pageNumber, setPageNumber] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [searchedItems, setSearchedItems] = useState({})

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size)
    setPageNumber(0)
  }, [])

  const itemTableColumns = useMemo(
    () => ({
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
        validator: (item) =>
          !item?.quantity || numberRegex.test(item?.quantity),
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
        component: (props) => (
          <SearchedItemTableActions {...props} handleAddItem={handleAddItem} />
        ),
        slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
      },
    }),
    [handleAddItem]
  )

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
        itemsResponse?.paginatedResults?.map((item) => [
          item?._id,
          { ...item, unitQuantity: '1' },
        ]) || []
      )
    )
  }, [itemsResponse?.paginatedResults])

  return (
    <Fragment>
      <Typography variant='h6'>Select Items</Typography>
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
          className='grow'
        />
      </ErrorAlert>
    </Fragment>
  )
}
