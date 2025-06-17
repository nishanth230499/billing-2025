'use server'

import { IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import LockResetIcon from '@mui/icons-material/LockReset'
import Link from 'next/link'
import getURLWithSearchParams from '@/lib/getURLWithSearchParams'

export default async function UsersTableActions({ searchParams, user }) {
  return (
    <>
      <IconButton
        href={await getURLWithSearchParams(searchParams, {
          edit_user: user?._id,
        })}
        LinkComponent={Link}>
        <EditIcon />
      </IconButton>
      <IconButton
        href={await getURLWithSearchParams(searchParams, {
          reset_password_user: user?._id,
        })}
        LinkComponent={Link}>
        <LockResetIcon />
      </IconButton>
    </>
  )
}
