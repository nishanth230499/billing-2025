'use client'

import { Box, Button, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'

import { getUsersAction } from '@/actions/userActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'

import CreateUserFormModal from './CreateUserFormModal'
import EditUserFormModal from './EditUserFormModal'
import ResetPasswordFormModal from './ResetPasswordFormModal'
import UsersTableActions from './UsersTableActions'

const usersTableColumns = {
  name: { label: 'Name' },
  emailId: { label: 'Email ID' },
  type: { label: 'Type' },
  active: {
    label: 'Active',
    component: ({ data: user }) => (user?.active ? 'Yes' : 'No'),
  },
  actions: {
    label: 'Actions',
    component: UsersTableActions,
    slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  },
}

export default function Page() {
  const { getURL, searchParams } = useHandleSearchParams()

  const pageNumber = useMemo(
    () => Number(searchParams.get('pageNumber')) || 0,
    [searchParams]
  )
  const pageSize = useMemo(
    () => Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE,
    [searchParams]
  )

  const {
    data: usersResponse,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getUsersAction, { pageNumber, pageSize }),
    queryKey: ['getUsersAction', pageNumber, pageSize],
  })
  return (
    <>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Users</Typography>
        <Button
          className='rounded-3xl'
          variant='outlined'
          onClick={() =>
            window.history.pushState({}, '', getURL({ create: true }))
          }>
          Create User
        </Button>
        <CreateUserFormModal refetchUsers={refetchUsers} />
        <EditUserFormModal refetchUsers={refetchUsers} />
        <ResetPasswordFormModal />
      </Box>

      {isUsersLoading && <TableSkeleton />}
      <ErrorAlert isError={isUsersError} error={usersError}>
        <DataTable
          hidden={isUsersLoading}
          data={Object.fromEntries(
            usersResponse?.paginatedResults?.map((user) => [user?._id, user]) ||
              []
          )}
          dataOrder={usersResponse?.paginatedResults?.map((user) => user?._id)}
          columns={usersTableColumns}
          totalCount={usersResponse?.totalCount}
        />
      </ErrorAlert>
    </>
  )
}
