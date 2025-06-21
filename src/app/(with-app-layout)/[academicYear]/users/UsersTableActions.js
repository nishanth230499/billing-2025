'use client'

import EditIcon from '@mui/icons-material/Edit'
import LockResetIcon from '@mui/icons-material/LockReset'
import { Box, IconButton } from '@mui/material'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'

export default function UsersTableActions({ data: user }) {
  const { getURL } = useHandleSearchParams()
  return (
    <Box className='flex'>
      <IconButton
        color='primary'
        onClick={() =>
          window.history.pushState({}, '', getURL({ edit_user: user?._id }))
        }>
        <EditIcon />
      </IconButton>
      <IconButton
        color='primary'
        onClick={() =>
          window.history.pushState(
            {},
            '',
            getURL({ reset_password_user: user?._id })
          )
        }>
        <LockResetIcon />
      </IconButton>
    </Box>
  )
}
