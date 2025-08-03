'use client'

import { Box, Button, Grid, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'

import { getItemsAction } from '@/actions/itemsActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import SearchBar from '@/components/common/SearchBar'
import CompanySelector from '@/components/common/selectors/CompanySelector'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'

import CreateItemFormModal from './CreateItemFormModal'

// import CompanyTableActions from './CompanyTableActions'
// import CreateCompanyFormModal from './CreateCompanyFormModal'
// import EditCompanyFormModal from './EditCompanyFormModal'

const itemTableColumns = {
  _id: { label: 'ID' },
  companyShortName: { label: 'Company' },
  name: { label: 'Name' },
  group: { label: 'Group' },
  price: { label: 'Price' },
  hsnId: { label: 'HSN' },
  // actions: {
  //   label: 'Actions',
  //   // component: CompanyTableActions,
  //   slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  // },
}

export default function Page() {
  const { getURL, searchParams } = useHandleSearchParams()

  const companyId = useMemo(
    () => searchParams.get('companyId') || '',
    [searchParams]
  )

  const pageNumber = useMemo(
    () => Number(searchParams.get('pageNumber')) || 0,
    [searchParams]
  )
  const pageSize = useMemo(
    () => Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE,
    [searchParams]
  )
  const searchText = useMemo(
    () => searchParams.get('searchText') || '',
    [searchParams]
  )

  const {
    data: itemsResponse,
    isLoading: isItemsLoading,
    isError: isItemsError,
    error: itemsError,
    refetch: refetchItems,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getItemsAction, {
        pageNumber,
        pageSize,
        companyId,
        searchText,
        sortFields: searchText ? {} : { _id: 1 },
      }),
    queryKey: ['getItemsAction', pageNumber, pageSize, companyId, searchText],
  })

  return (
    <>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Items</Typography>
        <Box className='flex items-center gap-2'>
          <Button
            className='rounded-3xl'
            variant='outlined'
            onClick={() =>
              window.history.pushState({}, '', getURL({ create: true }))
            }>
            Create New Item
          </Button>
        </Box>
      </Box>
      <Grid container columnSpacing={2} columns={3} className='mb-2'>
        <Grid size={{ xs: 3, sm: 1 }}>
          <CompanySelector
            selectedCompanyId={companyId}
            setSelectedCompanyId={(id) =>
              window.history.pushState(
                {},
                '',
                getURL({ companyId: id || null })
              )
            }
          />
        </Grid>
        <Grid size={{ xs: 3, sm: 2 }}>
          <SearchBar label='Search for Items' />
        </Grid>
      </Grid>
      <Box className='mb-4'></Box>
      <CreateItemFormModal refetchItems={refetchItems} />
      {/* <EditCompanyFormModal refetchCompanies={refetchCompanies} /> */}
      {isItemsLoading && <TableSkeleton />}
      <ErrorAlert isError={isItemsError} error={itemsError}>
        <DataTable
          hidden={isItemsLoading}
          data={Object.fromEntries(
            itemsResponse?.paginatedResults?.map((item) => [
              item?._id,
              { ...item, companyShortName: item?.company?.shortName },
            ]) || []
          )}
          dataOrder={itemsResponse?.paginatedResults?.map((user) => user?._id)}
          columns={itemTableColumns}
          totalCount={itemsResponse?.totalCount}
        />
      </ErrorAlert>
    </>
  )
}
