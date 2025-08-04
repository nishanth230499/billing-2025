'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useMemo } from 'react'

import { getUserAction, resetPasswordAction } from '@/actions/userActions'
import FormModal from '@/components/common/FormModal'
import useModalControl from '@/hooks/useModalControl'
import handleServerAction from '@/lib/handleServerAction'
import { passwordRegex } from '@/lib/regex'

export default function ResetPasswordFormModal() {
  const { modalValue: resettingPasswordUserId, handleCloseModal } =
    useModalControl('resetPasswordUser')

  const {
    data: userResponse,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getUserAction, resettingPasswordUserId),
    queryKey: ['getUserAction', resettingPasswordUserId],
    enabled: Boolean(resettingPasswordUserId),
  })

  const { mutate: resetPassword, isPending: isResetPasswordLoading } =
    useMutation({
      mutationFn: (data) => handleServerAction(resetPasswordAction, ...data),
    })

  const resetPasswordFormFields = useMemo(
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
        type: 'text',
        text: (
          <>
            Email: <b>{userResponse?.name}</b>
          </>
        ),
      },
      password: {
        type: 'input',
        label: 'Password',
        inputType: 'password',
        required: true,
        autoFocus: true,
        validator: (val, { confirmPassword }) => ({
          password: passwordRegex.test(val),
          confirmPassword: val === confirmPassword,
        }),
        helperText:
          'Password must contain atleast 1 number, 1 small letter, 1 capital letter, 1 special character and must be 8 to 15 characters long.',
      },
      confirmPassword: {
        type: 'input',
        label: 'Confirm Password',
        inputType: 'password',
        required: true,
        validator: (val, { password }) => val === password,
        helperText: 'Passwords should match',
      },
    }),
    [userResponse]
  )

  const initialFormFieldValues = useMemo(
    () => ({
      password: '',
      confirmPassword: '',
    }),
    []
  )

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      resetPassword([userResponse?._id, formFieldValues?.password], {
        onSuccess: async (data) => {
          enqueueSnackbar(data, { variant: 'success' })
          handleCloseModal()
        },
        onError: (error) =>
          enqueueSnackbar(error.message, { variant: 'error' }),
      })
    },
    [resetPassword, userResponse?._id, handleCloseModal]
  )

  return (
    <FormModal
      open={Boolean(resettingPasswordUserId)}
      title='Reset Password'
      formId='resetPassword'
      submitButtonLabel='Reset'
      formFields={resetPasswordFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isError={isUserError}
      error={userError}
      isFormLoading={isUserLoading}
      isSubmitLoading={isResetPasswordLoading}
      onSubmit={handleSubmit}
      onClose={handleCloseModal}
    />
  )
}
