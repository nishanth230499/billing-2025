'use client'

import { Box, Button, Paper, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import React, { useContext, useMemo } from 'react'

import { getCustomersAction } from '@/actions/customerActions'
import { AppContext } from '@/app/ClientProviders'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import SearchBar from '@/components/common/SearchBar'
import TableSkeleton from '@/components/TableSkeleton'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import useModalControl from '@/hooks/useModalControl'
import usePaginationControl from '@/hooks/usePaginationControl'
import handleServerAction from '@/lib/handleServerAction'

import AddExistingCustomerFormModal from './AddExistingCustomerFormModal'
import CreateCustomerFormModal from './CreateCustomerFormModal'
import CustomerTableActions from './CustomerTableActions'
import EditCustomerFormModal from './EditCustomerFormModal'
import ViewShippingAddressModal from './ViewShippingAddressModal'

const customersTableColumns = {
  _id: { label: 'ID' },
  name: { label: 'Name' },
  place: { label: 'Place' },
  actions: {
    label: 'Actions',
    component: CustomerTableActions,
    slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  },
}

export default function Page() {
  const { searchParams, replaceURL } = useHandleSearchParams()
  const params = useParams()

  const stockCycleId = params.stockCycle

  const searchText = useMemo(
    () => searchParams.get('searchText') || '',
    [searchParams]
  )
  const { appConfig } = useContext(AppContext)
  const { IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE } = appConfig

  const paginationProps = usePaginationControl()
  const { setModalValue: setCreateUserModalValue } = useModalControl('create')
  const { setModalValue: setAddUserModalValue } = useModalControl('add')

  const {
    data: customersResponse,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
    error: customersError,
    refetch: refetchCustomers,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCustomersAction, {
        pageNumber: paginationProps?.pageNumber,
        pageSize: paginationProps?.pageSize,
        searchText,
        filter: IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE
          ? { stockCycle: { id: stockCycleId } }
          : {},
        sortFields: searchText ? {} : { _id: 1 },
      }),
    queryKey: [
      'getCustomersAction',
      paginationProps?.pageNumber,
      paginationProps?.pageSize,
      searchText,
    ],
  })

  return (
    <Paper className='overflow-auto h-full flex flex-col p-4'>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Customers</Typography>
        <Box className='flex items-center gap-2'>
          <Button
            className='rounded-3xl'
            variant='outlined'
            onClick={() => setCreateUserModalValue(true)}>
            Create New Customer
          </Button>
          {IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE && (
            <Button
              className='rounded-3xl hidden sm:block'
              variant='outlined'
              onClick={() => setAddUserModalValue(true)}>
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
            onClick={() => setAddUserModalValue(true)}>
            Add Existing Customer
          </Button>
        </Box>
      )}
      <Box className='mb-4'>
        <SearchBar
          label='Search for Customers'
          searchText={searchText}
          setSearchText={(text) =>
            replaceURL({ searchText: text || undefined })
          }
        />
      </Box>
      <CreateCustomerFormModal refetchCustomers={refetchCustomers} />
      <AddExistingCustomerFormModal refetchCustomers={refetchCustomers} />
      <EditCustomerFormModal refetchCustomers={refetchCustomers} />
      <ViewShippingAddressModal />
      {isCustomersLoading && <TableSkeleton />}
      <ErrorAlert isError={isCustomersError} error={customersError}>
        <DataTable
          hidden={isCustomersLoading}
          data={Object.fromEntries(
            customersResponse?.paginatedResults?.map((user) => [
              user?._id,
              { ...user, _metaData: { highlightColor: user?.firm?.color } },
            ]) || []
          )}
          dataOrder={customersResponse?.paginatedResults?.map(
            (user) => user?._id
          )}
          columns={customersTableColumns}
          paginationProps={{
            ...paginationProps,
            totalCount: customersResponse?.totalCount,
          }}
        />
      </ErrorAlert>
    </Paper>
  )
}
