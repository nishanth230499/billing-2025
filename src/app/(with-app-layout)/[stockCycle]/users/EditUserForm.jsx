'use client'

import { getUserAction } from '@/actions/userActions'
import CreateOrEditUserForm from './CreateOrEditUserForm'
import { useSearchParams } from 'next/navigation'
import { LOADING } from '@/constants'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import handleServerAction from '@/lib/handleServerAction'
import ErrorAlert from '@/components/common/ErrorAlert'

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

  return (
    <>
      {isUserLoading ? LOADING : null}
      <ErrorAlert isError={isUserError} error={userError}>
        <CreateOrEditUserForm
          isEditing
          editingUser={userResponse}
          hidden={isUserLoading}
          refetchUsers={refetchUsers}
        />
      </ErrorAlert>
    </>
  )
}
