'use server'

import { Box, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import LockResetIcon from '@mui/icons-material/LockReset'
import Link from 'next/link'
import getURLWithSearchParams from '@/lib/getURLWithSearchParams'

export default async function UsersTableActions({ searchParams, user }) {
  return (
    <Box className='flex'>
      <IconButton
        color='primary'
        href={await getURLWithSearchParams(searchParams, {
          edit_user: user?._id,
        })}
        LinkComponent={Link}>
        <EditIcon />
      </IconButton>
      <IconButton
        color='primary'
        href={await getURLWithSearchParams(searchParams, {
          reset_password_user: user?._id,
        })}
        LinkComponent={Link}>
        <LockResetIcon />
      </IconButton>
    </Box>
  )
}
