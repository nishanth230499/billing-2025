'use client'

import { Box, Button, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import React, { useContext, useMemo } from 'react'

import { getCustomersAction } from '@/actions/customerActions'
import { AppContext } from '@/app/ClientProviders'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import SearchBar from '@/components/common/SearchBar'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'

import AddExistingCustomerFormModal from './AddExistingCustomerFormModal'
import CreateCustomerFormModal from './CreateCustomerFormModal'

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
  const { IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE } = appConfig

  const {
    data: customersResponse,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
    error: customersError,
    refetch: refetchCustomers,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCustomersAction, {
        pageNumber,
        pageSize,
        searchText,
        filter: IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE
          ? { stockCycle: { id: stockCycleId } }
          : {},
        sortFields: searchText ? {} : { _id: 1 },
      }),
    queryKey: ['getCustomersAction', pageNumber, pageSize, searchText],
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
          {IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE && (
            <Button
              className='rounded-3xl hidden sm:block'
              variant='outlined'
              onClick={() =>
                window.history.pushState({}, '', getURL({ add: true }))
              }>
              Add Existing Customer
            </Button>
          )}
        </Box>
      </Box>
      {IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE && (
        <Box className='flex items-center justify-end mb-4 sm:hidden'>
          <Button
            className='rounded-3xl'
            variant='outlined'
            onClick={() =>
              window.history.pushState({}, '', getURL({ add: true }))
            }>
            Add Existing Customer
          </Button>
        </Box>
      )}
      <Box className='mb-4'>
        <SearchBar label='Search for Customers' />
      </Box>
      <CreateCustomerFormModal refetchCustomers={refetchCustomers} />
      <AddExistingCustomerFormModal refetchCustomers={refetchCustomers} />
      {isCustomersLoading && <TableSkeleton />}
      <ErrorAlert isError={isCustomersError} error={customersError}>
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
            return data?.firm?.color
          }}
        />
      </ErrorAlert>
    </>
  )
}
