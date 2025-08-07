'use client'

import { Button, DialogContent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { getSalesOrdersAction } from '@/actions/salesOrderActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import Modal from '@/components/common/Modal'
import TableSkeleton from '@/components/TableSkeleton'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import useModalControl from '@/hooks/useModalControl'
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
}

export default function ViewSalesOrdersModal() {
  const params = useParams()
  const { getNewURL } = useHandleSearchParams()

  const stockCycleId = params.stockCycle
  const paginationProps = usePaginationControl(
    'salesOrdersPageNumber',
    'salesOrdersPageSize'
  )

  const { modalValue: customerId, handleCloseModal } = useModalControl(
    'viewSalesOrders',
    ['salesOrdersPageNumber', 'salesOrdersPageSize']
  )

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
        customerId,
      }),
    queryKey: [
      'getSalesOrdersAction',
      paginationProps?.pageNumber,
      paginationProps?.pageSize,
      stockCycleId,
      customerId,
    ],
    enabled: Boolean(customerId),
  })

  return (
    <Modal
      open={Boolean(customerId)}
      title='Sales Order'
      onClose={handleCloseModal}>
      <DialogContent className='flex flex-col items-start'>
        <Button
          className='rounded-3xl mb-4'
          variant='outlined'
          LinkComponent={Link}
          href={getNewURL(`/${stockCycleId}/sales-order/create`, {
            customerId,
          })}>
          Create Sales Order
        </Button>
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
      </DialogContent>
    </Modal>
  )
}
