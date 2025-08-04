'use client'

import { useMutation } from '@tanstack/react-query'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useMemo } from 'react'

import { createUserAction } from '@/actions/userActions'
import FormModal from '@/components/common/FormModal'
import useModalControl from '@/hooks/useModalControl'
import handleServerAction from '@/lib/handleServerAction'
import { emailRegex, nonEmptyRegex, passwordRegex } from '@/lib/regex'
import { UserType } from '@/models/User'

export default function CreateOrEditUserForm({ refetchUsers }) {
  const { modalValue, handleCloseModal } = useModalControl('create')

  const { mutate: createUser, isPending: isCreateUserLoading } = useMutation({
    mutationFn: (data) => handleServerAction(createUserAction, data),
  })

  const createUserFormFields = useMemo(
    () => ({
      emailId: {
        type: 'input',
        label: 'Email ID',
        inputName: 'email',
        autoFocus: true,
        required: true,
        validator: (val) => emailRegex.test(val),
      },
      name: {
        type: 'input',
        label: 'Name',
        required: true,
        validator: (val) => nonEmptyRegex.test(val),
      },
      password: {
        type: 'input',
        label: 'Password',
        inputType: 'password',
        required: true,
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
      type: {
        type: 'select',
        label: 'User Type',
        regex: nonEmptyRegex,
        options: Object.values(UserType).map((type) => ({
          value: type,
          label: type,
        })),
        // TODO: Change validator to accept only 3 values
        validator: (val) => nonEmptyRegex.test(val),
        size: 6,
      },
      active: {
        type: 'switch',
        label: 'Active',
        size: 6,
      },
    }),
    []
  )

  const initialFormFieldValues = useMemo(
    () => ({
      emailId: '',
      name: '',
      password: '',
      confirmPassword: '',
      type: UserType.NORMAL,
      active: false,
    }),
    []
  )

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      createUser(
        {
          emailId: formFieldValues?.emailId?.trim(),
          name: formFieldValues?.name?.trim(),
          password: formFieldValues?.password,
          type: formFieldValues?.type,
          active: formFieldValues?.active,
        },
        {
          onSuccess: async (data) => {
            enqueueSnackbar(data, { variant: 'success' })
            await refetchUsers()
            handleCloseModal()
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    },
    [createUser, handleCloseModal, refetchUsers]
  )

  return (
    <FormModal
      open={Boolean(modalValue)}
      title='Create User'
      formId='createUser'
      submitButtonLabel='Create'
      formFields={createUserFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isSubmitLoading={isCreateUserLoading}
      onSubmit={handleSubmit}
      onClose={handleCloseModal}
    />
  )
}
