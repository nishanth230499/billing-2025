'use client'

import { Box, Button, Paper, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'

import { getSalesOrdersAction } from '@/actions/salesOrderActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import TableSkeleton from '@/components/TableSkeleton'
import usePaginationControl from '@/hooks/usePaginationControl'
import handleServerAction from '@/lib/handleServerAction'

const salesOrdersTableColumns = {
  number: { label: 'Number' },
  date: { label: 'Order Date' },
  customer: {
    label: 'Customer',
    component: ({ data: order }) => order?.customer?.name ?? '',
  },
  customerShippingAddress: {
    label: 'Shipping Address',
    component: ({ data: order }) => order?.customerShippingAddress?.name ?? '',
  },
  orderRef: {
    label: 'Order Ref',
    component: ({ data: order }) => order?.orderRef,
  },
  isSetPack: {
    label: 'Set Pack',
    component: ({ data: order }) => (order?.isSetPack ? 'Yes' : 'No'),
  },
  supplyDate: {
    label: 'Supply Date',
    component: ({ data: order }) => order?.supplyDate,
  },
  actions: {
    label: 'Actions',
    // component: UsersTableActions,
    slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  },
}

export default function Page() {
  const params = useParams()

  const stockCycleId = params.stockCycle
  const paginationProps = usePaginationControl()

  const {
    data: salesOrdersResponse,
    isLoading: isSalesOrdersLoading,
    isError: isSalesOrdersError,
    error: salesOrdersError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getSalesOrdersAction, {
        pageNumber: paginationProps?.pageNumber,
        pageSize: paginationProps?.pageSize,
        stockCycleId,
      }),
    queryKey: [
      'getSalesOrdersAction',
      paginationProps?.pageNumber,
      paginationProps?.pageSize,
      stockCycleId,
    ],
  })
  return (
    <Paper className='overflow-auto h-full flex flex-col p-4'>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Sales Orders</Typography>
        <Button
          className='rounded-3xl'
          variant='outlined'
          href={`/${stockCycleId}/sales-order/create`}
          component={Link}>
          Create Sales Order
        </Button>
      </Box>

      {isSalesOrdersLoading && <TableSkeleton />}
      <ErrorAlert isError={isSalesOrdersError} error={salesOrdersError}>
        <DataTable
          hidden={isSalesOrdersLoading}
          data={Object.fromEntries(
            salesOrdersResponse?.paginatedResults?.map((salesOrder) => [
              salesOrder?._id,
              salesOrder,
            ]) || []
          )}
          dataOrder={salesOrdersResponse?.paginatedResults?.map(
            (salesOrder) => salesOrder?._id
          )}
          columns={salesOrdersTableColumns}
          paginationProps={{
            ...paginationProps,
            totalCount: salesOrdersResponse?.totalCount,
          }}
        />
      </ErrorAlert>
    </Paper>
  )
}
