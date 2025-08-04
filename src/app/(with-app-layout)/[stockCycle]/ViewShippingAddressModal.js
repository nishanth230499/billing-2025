'use client'

import { Button, DialogContent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import { getCustomerShippingAddressesAction } from '@/actions/customerShippingAddressActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import Modal from '@/components/common/Modal'
import TableSkeleton from '@/components/TableSkeleton'
import useModalControl from '@/hooks/useModalControl'
import usePaginationControl from '@/hooks/usePaginationControl'
import handleServerAction from '@/lib/handleServerAction'

import CreateShippingAddressFormModal from './CreateShippingAddressFormModal'
import EditCustomerShippingAddressFormModal from './EditShippingAddressFormModal'
import ShippingAddressTableActions from './ShippingAddressTableActions'

const shippingAddressTableColumns = {
  _id: { label: 'ID' },
  name: { label: 'Name' },
  actions: {
    label: 'Actions',
    component: ShippingAddressTableActions,
    slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  },
}

export default function ViewShippingAddressModal() {
  const paginationProps = usePaginationControl(
    'shippingAddressPageNumber',
    'shippingAddressPageSize'
  )
  const { modalValue: customerId, handleCloseModal } = useModalControl(
    'viewShippingAddress',
    ['shippingAddressPageNumber', 'shippingAddressPageSize']
  )
  const { setModalValue: setCreateShippingAddressModalValue } = useModalControl(
    'createShippingAddress'
  )

  const {
    data: shippingAddressResponse,
    isLoading: isShippingAddressLoading,
    isError: isShippingAddressError,
    error: shippingAddressError,
    refetch: refetchShippingAddress,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCustomerShippingAddressesAction, {
        pageNumber: paginationProps?.pageNumber,
        pageSize: paginationProps?.pageSize,
        customerId,
      }),
    queryKey: [
      'getCustomerShippingAddressesAction',
      paginationProps?.pageNumber,
      paginationProps?.pageSize,
      customerId,
    ],
    enabled: Boolean(customerId),
  })

  return (
    <Modal
      open={Boolean(customerId)}
      title={'Shipping Addresses'}
      onClose={handleCloseModal}>
      <DialogContent className='flex flex-col items-start'>
        <Button
          className='rounded-3xl mb-4'
          variant='outlined'
          onClick={() => setCreateShippingAddressModalValue(true)}>
          Create Shipping Address
        </Button>
        <CreateShippingAddressFormModal
          refetchShippingAddress={refetchShippingAddress}
        />
        <EditCustomerShippingAddressFormModal
          refetchShippingAddress={refetchShippingAddress}
        />
        {isShippingAddressLoading && <TableSkeleton />}
        <ErrorAlert
          isError={isShippingAddressError}
          error={shippingAddressError}>
          <DataTable
            hidden={isShippingAddressLoading}
            data={Object.fromEntries(
              shippingAddressResponse?.paginatedResults?.map(
                (shippingAddress) => [shippingAddress?._id, shippingAddress]
              ) || []
            )}
            dataOrder={shippingAddressResponse?.paginatedResults?.map(
              (user) => user?._id
            )}
            columns={shippingAddressTableColumns}
            paginationProps={{
              ...paginationProps,
              totalCount: shippingAddressResponse?.totalCount,
            }}
          />
        </ErrorAlert>
      </DialogContent>
    </Modal>
  )
}
