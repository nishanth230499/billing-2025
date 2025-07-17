'use client'

import { getUserAction } from '@/actions/userActions'
import CreateOrEditUserForm from './CreateOrEditUserForm'
import { Alert } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { LOADING } from '@/constants'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import handleServerAction from '@/lib/handleServerAction'

export default function EditUserForm({ refetchUsers }) {
  const searchParams = useSearchParams()

  const editingUserId = useMemo(
    () => searchParams.get('edit_user'),
    [searchParams]
  )

  const {
    data: userResponse,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryFn: async () => await handleServerAction(getUserAction, editingUserId),
    queryKey: ['getUserAction', editingUserId],
    enabled: Boolean(editingUserId),
  })

  if (isUserError) {
    return <Alert severity='error'>{userError?.message}</Alert>
  }
  return (
    <>
      {isUserLoading ? LOADING : null}
      <CreateOrEditUserForm
        isEditing
        editingUser={userResponse}
        hidden={isUserLoading}
        refetchUsers={refetchUsers}
      />
    </>
  )
}
