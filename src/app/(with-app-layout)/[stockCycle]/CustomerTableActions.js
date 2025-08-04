'use client'

import EditIcon from '@mui/icons-material/Edit'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import { Box, IconButton, Tooltip } from '@mui/material'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'

export default function CustomerTableActions({ data }) {
  const { getURL } = useHandleSearchParams()
  return (
    <Box className='flex'>
      <Tooltip title='Edit Customer'>
        <IconButton
          color='primary'
          onClick={() =>
            window.history.pushState(
              {},
              '',
              getURL({ editCustomer: data?._id })
            )
          }>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title='View Shipping Addresses'>
        <IconButton
          color='primary'
          onClick={() =>
            window.history.pushState(
              {},
              '',
              getURL({ viewShippingAddress: data?._id })
            )
          }>
          <LocalShippingIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
