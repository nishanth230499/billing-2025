'use client'

import EditIcon from '@mui/icons-material/Edit'
import LockResetIcon from '@mui/icons-material/LockReset'
import { Box, IconButton, Tooltip } from '@mui/material'
import Link from 'next/link'

import useModalControl from '@/hooks/useModalControl'

export default function UsersTableActions({ data: user }) {
  const { getModalURL: getEditUserModalURL } = useModalControl('editUser')
  const { getModalURL: getResetPasswordModalURL } =
    useModalControl('resetPasswordUser')

  return (
    <Box className='flex'>
      <Tooltip title='Edit User'>
        <IconButton
          color='primary'
          LinkComponent={Link}
          href={getEditUserModalURL(user?._id)}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title='Reset Password'>
        <IconButton
          color='primary'
          LinkComponent={Link}
          href={getResetPasswordModalURL(user?._id)}>
          <LockResetIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
