'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useMemo } from 'react'

import { editUserAction, getUserAction } from '@/actions/userActions'
import FormModal from '@/components/common/FormModal'
import handleServerAction from '@/lib/handleServerAction'
import { nonEmptyRegex } from '@/lib/regex'
import { UserType } from '@/models/User'

export default function EditUserFormModal({ refetchUsers }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const editingUserId = useMemo(
    () => searchParams.get('editUser'),
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

  const { mutate: editUser, isPending: isEditUserLoading } = useMutation({
    mutationFn: (data) => handleServerAction(editUserAction, ...data),
  })

  const editUserFormFields = useMemo(
    () => ({
      email: {
        type: 'text',
        text: (
          <>
            Email: <b>{userResponse?.emailId}</b>
          </>
        ),
      },
      name: {
        type: 'input',
        label: 'Name',
        autoFocus: true,
        required: true,
        validator: (val) => nonEmptyRegex.test(val),
      },
      type: {
        type: 'select',
        label: 'User Type',
        regex: nonEmptyRegex,
        options: Object.values(UserType).map((type) => ({
          value: type,
          label: type,
        })),
        required: true,
        // TODO: Change validator to accept only 2 values
        validator: (val) => nonEmptyRegex.test(val),
        size: 6,
      },
      active: {
        type: 'switch',
        label: 'Active',
        size: 6,
      },
    }),
    [userResponse]
  )

  const initialFormFieldValues = useMemo(
    () => ({
      name: userResponse?.name,
      type: userResponse?.type ?? UserType.NORMAL,
      active: userResponse?.active ?? false,
    }),
    [userResponse?.active, userResponse?.name, userResponse?.type]
  )

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      editUser(
        [
          editingUserId,
          {
            name: formFieldValues?.name?.trim(),
            active: formFieldValues?.active,
            type: formFieldValues?.type,
          },
        ],
        {
          onSuccess: async (data) => {
            enqueueSnackbar(data, { variant: 'success' })
            await refetchUsers()
            router.back()
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    },
    [editUser, editingUserId, refetchUsers, router]
  )

  return (
    <FormModal
      open={Boolean(editingUserId)}
      title='Edit User'
      formId='editUser'
      submitButtonLabel='Save'
      formFields={editUserFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isError={isUserError}
      error={userError}
      isFormLoading={isUserLoading}
      isSubmitLoading={isEditUserLoading}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  )
}
