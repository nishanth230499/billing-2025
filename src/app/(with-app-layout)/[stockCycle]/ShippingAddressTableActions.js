'use client'

import EditIcon from '@mui/icons-material/Edit'
import { IconButton, Tooltip } from '@mui/material'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'

export default function ShippingAddressTableActions({ data }) {
  const { getURL } = useHandleSearchParams()
  return (
    <Tooltip title='Edit Shipping Address'>
      <IconButton
        color='primary'
        onClick={() =>
          window.history.pushState(
            {},
            '',
            getURL({ editShippingAddress: data?._id })
          )
        }>
        <EditIcon />
      </IconButton>
    </Tooltip>
  )
}
