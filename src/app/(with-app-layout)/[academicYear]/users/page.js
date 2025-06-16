'use server'

import React, { Suspense } from 'react'
import UsersTable from './UsersTable'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import { Box, Button, Dialog, DialogTitle, Typography } from '@mui/material'
import Link from 'next/link'
import Modal from '@/components/common/Modal'
import getURLWithSearchParams from '@/lib/getURLWithSearchParams'

export default async function Page({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise

  const pageNumber = Number(searchParams?.pageNumber) || 0
  const pageSize = Number(searchParams?.pageSize) || DEFAULT_PAGE_SIZE
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
      </Box>
      <Suspense fallback={<TableSkeleton />}>
        <UsersTable pageNumber={pageNumber} pageSize={pageSize} />
        {/* <TableSkeleton /> */}
      </Suspense>
    </>
  )
}
