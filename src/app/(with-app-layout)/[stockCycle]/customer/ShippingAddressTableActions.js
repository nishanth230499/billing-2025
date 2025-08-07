'use client'

import EditIcon from '@mui/icons-material/Edit'
import { IconButton, Tooltip } from '@mui/material'
import Link from 'next/link'

import useModalControl from '@/hooks/useModalControl'

export default function ShippingAddressTableActions({ data }) {
  const { getModalURL: getEditShippingAddressModalURL } = useModalControl(
    'editShippingAddress'
  )
  return (
    <Tooltip title='Edit Shipping Address'>
      <IconButton
        color='primary'
        LinkComponent={Link}
        href={getEditShippingAddressModalURL(data?._id)}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  )
}
