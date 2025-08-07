'use client'

import { Box, Button, Grid, Paper, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import React, { useMemo } from 'react'

import { getItemsAction } from '@/actions/itemsActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import SearchBar from '@/components/common/SearchBar'
import CompanySelector from '@/components/common/selectors/CompanySelector'
import TableSkeleton from '@/components/TableSkeleton'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import useModalControl from '@/hooks/useModalControl'
import usePaginationControl from '@/hooks/usePaginationControl'
import handleServerAction from '@/lib/handleServerAction'
import { formatAmount } from '@/lib/utils/amoutUtils'

import CreateItemFormModal from './CreateItemFormModal'
import EditItemFormModal from './EditItemFormModal'
import ItemTableActions from './ItemTableActions'

const itemTableColumns = {
  _id: { label: 'ID' },
  companyShortName: {
    label: 'Company Short Name',
    format: (item) => item?.company?.shortName,
  },
  name: { label: 'Name' },
  group: { label: 'Group' },
  price: { label: 'Price', format: (item) => formatAmount(item?.price) ?? '' },
  hsnId: { label: 'HSN' },
  actions: {
    label: 'Actions',
    component: ItemTableActions,
    slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  },
}

export default function Page() {
  const { searchParams, replaceURL } = useHandleSearchParams()

  const companyId = useMemo(
    () => searchParams.get('companyId') || '',
    [searchParams]
  )

  const searchText = useMemo(
    () => searchParams.get('searchText') || '',
    [searchParams]
  )

  const paginationProps = usePaginationControl()
  const { getModalURL: getCreateItemModalURL } = useModalControl('create')

  const {
    data: itemsResponse,
    isLoading: isItemsLoading,
    isError: isItemsError,
    error: itemsError,
    refetch: refetchItems,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getItemsAction, {
        pageNumber: paginationProps?.pageNumber,
        pageSize: paginationProps?.pageSize,
        companyId,
        searchText,
        sortFields: searchText ? {} : { _id: 1 },
      }),
    queryKey: [
      'getItemsAction',
      paginationProps?.pageNumber,
      paginationProps?.pageSize,
      companyId,
      searchText,
    ],
  })

  return (
    <Paper className='overflow-auto h-full flex flex-col p-4'>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Items</Typography>
        <Box className='flex items-center gap-2'>
          <Button
            className='rounded-3xl'
            variant='outlined'
            LinkComponent={Link}
            href={getCreateItemModalURL(true)}>
            Create New Item
          </Button>
        </Box>
      </Box>
      <Grid container columnSpacing={2} columns={3} className='mb-2'>
        <Grid size={{ xs: 3, sm: 1 }}>
          <CompanySelector
            selectedCompanyId={companyId}
            setSelectedCompanyId={(id) => replaceURL({ companyId: id || null })}
          />
        </Grid>
        <Grid size={{ xs: 3, sm: 2 }}>
          <SearchBar
            label='Search for Items'
            searchText={searchText}
            setSearchText={(text) =>
              replaceURL({ searchText: text || undefined })
            }
          />
        </Grid>
      </Grid>
      <Box className='mb-4'></Box>
      <CreateItemFormModal refetchItems={refetchItems} />
      <EditItemFormModal refetchItems={refetchItems} />
      {isItemsLoading && <TableSkeleton />}
      <ErrorAlert isError={isItemsError} error={itemsError}>
        <DataTable
          hidden={isItemsLoading}
          data={Object.fromEntries(
            itemsResponse?.paginatedResults?.map((item) => [item?._id, item]) ||
              []
          )}
          dataOrder={itemsResponse?.paginatedResults?.map((user) => user?._id)}
          columns={itemTableColumns}
          paginationProps={{
            ...paginationProps,
            totalCount: itemsResponse?.totalCount,
          }}
        />
      </ErrorAlert>
    </Paper>
  )
}
