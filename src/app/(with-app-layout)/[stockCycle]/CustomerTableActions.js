'use client'

import EditIcon from '@mui/icons-material/Edit'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import { Box, IconButton, Tooltip } from '@mui/material'

import useModalControl from '@/hooks/useModalControl'

export default function CustomerTableActions({ data }) {
  const { setModalValue: setEditCustomerModalValue } =
    useModalControl('editCustomer')

  const { setModalValue: setViewShippingAddressModalValue } = useModalControl(
    'viewShippingAddress'
  )
  return (
    <Box className='flex'>
      <Tooltip title='Edit Customer'>
        <IconButton
          color='primary'
          onClick={() => setEditCustomerModalValue(data?._id)}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title='View Shipping Addresses'>
        <IconButton
          color='primary'
          onClick={() => setViewShippingAddressModalValue(data?._id)}>
          <LocalShippingIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
