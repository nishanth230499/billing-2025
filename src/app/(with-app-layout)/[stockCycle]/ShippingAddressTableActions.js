'use client'

import EditIcon from '@mui/icons-material/Edit'
import { IconButton, Tooltip } from '@mui/material'

import useModalControl from '@/hooks/useModalControl'

export default function ShippingAddressTableActions({ data }) {
  const { setModalValue: setEditShippingAddressModalValue } = useModalControl(
    'editShippingAddress'
  )
  return (
    <Tooltip title='Edit Shipping Address'>
      <IconButton
        color='primary'
        onClick={() => setEditShippingAddressModalValue(data?._id)}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  )
}
