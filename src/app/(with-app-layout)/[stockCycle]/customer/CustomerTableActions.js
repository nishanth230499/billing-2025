'use client'

import EditIcon from '@mui/icons-material/Edit'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import { Box, IconButton, Tooltip } from '@mui/material'
import Link from 'next/link'

import useModalControl from '@/hooks/useModalControl'

export default function CustomerTableActions({ data }) {
  const { getModalURL: getEditCustomerModalURL } =
    useModalControl('editCustomer')

  const { getModalURL: getViewShippingAddressModalURL } = useModalControl(
    'viewShippingAddress'
  )

  const { getModalURL: getViewSalesOrdersModalURL } =
    useModalControl('viewSalesOrders')

  return (
    <Box className='flex'>
      <Tooltip title='Edit Customer'>
        <IconButton
          color='primary'
          LinkComponent={Link}
          href={getEditCustomerModalURL(data?._id)}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title='View Shipping Addresses'>
        <IconButton
          color='primary'
          LinkComponent={Link}
          href={getViewShippingAddressModalURL(data?._id)}>
          <LocalShippingIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title='View Sales Orders'>
        <IconButton
          color='primary'
          LinkComponent={Link}
          href={getViewSalesOrdersModalURL(data?._id)}>
          <PlaylistAddIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
