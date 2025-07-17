'use client'

import { Alert, Box, Button, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import React, { useContext, useMemo } from 'react'

import { getCustomersAction } from '@/actions/customerActions'
import { AppContext } from '@/app/ClientProviders'
import DataTable from '@/components/common/DataTable'
import SearchBar from '@/components/common/SearchBar'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'
import { modelConstants } from '@/models/constants'

const customersTableColumns = {
  _id: { label: 'ID' },
  name: { label: 'Name' },
  place: { label: 'Place' },
}

export default function Page() {
  const { getURL, searchParams } = useHandleSearchParams()
  const params = useParams()

  const stockCycleId = params.stockCycle

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
  const { appConfig } = useContext(AppContext)
  const { CUSTOMER_DETAILS_SPECIFIC_TO } = appConfig

  const {
    data: customersResponse,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
    error: customersError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCustomersAction, {
        pageNumber,
        pageSize,
        searchText,
        filter: CUSTOMER_DETAILS_SPECIFIC_TO.includes(
          modelConstants.stock_cycle.collectionName
        )
          ? { stockCycle: { id: stockCycleId, exists: true } }
          : {},
        sortFields: searchText ? {} : { _id: 1 },
      }),
    queryKey: [pageNumber, pageSize, searchText],
  })

  return (
    <>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Customers</Typography>
        <Box className='flex items-center gap-2'>
          <Button
            className='rounded-3xl'
            variant='outlined'
            onClick={() =>
              window.history.pushState({}, '', getURL({ create: true }))
            }>
            Create New Customer
          </Button>
          {CUSTOMER_DETAILS_SPECIFIC_TO.includes(
            modelConstants.stock_cycle.collectionName
          ) && (
            <Button
              className='rounded-3xl hidden sm:block'
              variant='outlined'
              onClick={() =>
                window.history.pushState({}, '', getURL({ add: true }))
              }>
              Add Customer From Previous Records
            </Button>
          )}
        </Box>
      </Box>
      {CUSTOMER_DETAILS_SPECIFIC_TO.includes(
        modelConstants.stock_cycle.collectionName
      ) && (
        <Box className='flex items-center justify-end mb-4 sm:hidden'>
          <Button
            className='rounded-3xl'
            variant='outlined'
            onClick={() =>
              window.history.pushState({}, '', getURL({ add: true }))
            }>
            Add Customer From Previous Records
          </Button>
        </Box>
      )}
      <Box className='mb-4'>
        <SearchBar label='Search For Schools' />
      </Box>
      {isCustomersLoading && <TableSkeleton />}
      {isCustomersError ? (
        <Alert severity='error'>{customersError.message}</Alert>
      ) : (
        <DataTable
          hidden={isCustomersLoading}
          data={Object.fromEntries(
            customersResponse?.paginatedResults?.map((user) => [
              user?._id,
              user,
            ]) || []
          )}
          dataOrder={customersResponse?.paginatedResults?.map(
            (user) => user?._id
          )}
          columns={customersTableColumns}
          totalCount={customersResponse?.totalCount}
          getHighLightColor={(data) => {
            return data?.firm?.[0]?.color
          }}
        />
      )}
    </>
  )
}
