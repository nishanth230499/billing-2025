'use client'

import { Button, DialogContent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

import { getCustomerShippingAddressesAction } from '@/actions/customerShippingAddressActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import Modal from '@/components/common/Modal'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getURL } = useHandleSearchParams()

  const customerId = useMemo(
    () => searchParams.get('viewShippingAddress') ?? '',
    [searchParams]
  )

  const pageNumber = useMemo(
    () => Number(searchParams.get('shippingAddressPageNumber')) || 0,
    [searchParams]
  )
  const pageSize = useMemo(
    () =>
      Number(searchParams.get('shippingAddressPageSize')) || DEFAULT_PAGE_SIZE,
    [searchParams]
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
        pageNumber,
        pageSize,
        customerId,
      }),
    queryKey: [
      'getCustomerShippingAddressesAction',
      pageNumber,
      pageSize,
      customerId,
    ],
    enabled: Boolean(customerId),
  })

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  return (
    <Modal
      open={Boolean(customerId)}
      title={'Shipping Addresses'}
      onClose={handleClose}>
      <DialogContent>
        <Button
          className='rounded-3xl mb-4'
          variant='outlined'
          onClick={() =>
            window.history.pushState(
              {},
              '',
              getURL({ createShippingAddress: true })
            )
          }>
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
            totalCount={shippingAddressResponse?.totalCount}
            pageNumberSearchParamName='shippingAddressPageNumber'
            pageSizeSearchParamName='shippingAddressPageSize'
          />
        </ErrorAlert>
      </DialogContent>
    </Modal>
  )
}
