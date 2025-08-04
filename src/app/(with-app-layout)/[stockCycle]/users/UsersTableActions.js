'use client'

import EditIcon from '@mui/icons-material/Edit'
import LockResetIcon from '@mui/icons-material/LockReset'
import { Box, IconButton, Tooltip } from '@mui/material'

import useModalControl from '@/hooks/useModalControl'

export default function UsersTableActions({ data: user }) {
  const { setModalValue: setEditUserModalValue } = useModalControl('editUser')
  const { setModalValue: setResetPasswordModalValue } =
    useModalControl('resetPasswordUser')

  return (
    <Box className='flex'>
      <Tooltip title='Edit User'>
        <IconButton
          color='primary'
          onClick={() => setEditUserModalValue(user?._id)}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title='Reset Password'>
        <IconButton
          color='primary'
          onClick={() => setResetPasswordModalValue(user?._id)}>
          <LockResetIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
