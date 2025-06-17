'use server'

import React, { Suspense } from 'react'
import TableSkeleton from '@/components/TableSkeleton'
import { Box, Button, Typography } from '@mui/material'
import Link from 'next/link'
import Modal from '@/components/common/Modal'
import getURLWithSearchParams from '@/lib/getURLWithSearchParams'
import UsersTable from './UsersTable'

export default async function Page({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise

  return (
    <>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Users</Typography>
        <Button
          className='rounded-3xl px-4'
          variant='outlined'
          href={await getURLWithSearchParams(searchParams, { create: true })}
          LinkComponent={Link}>
          Create new User
        </Button>
        <Modal openSearchParamKey='create' title='Create User'></Modal>
        <Modal openSearchParamKey='edit_user' title='Edit User'></Modal>
        <Modal
          openSearchParamKey='reset_password_user'
          title='Reset Password'></Modal>
      </Box>
      <Suspense fallback={<TableSkeleton />}>
        <UsersTable searchParams={searchParams} />
        {/* <TableSkeleton /> */}
      </Suspense>
    </>
  )
}
