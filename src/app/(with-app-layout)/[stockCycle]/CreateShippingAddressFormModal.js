'use client'

import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useMemo } from 'react'

import { createCustomerShippingAddressAction } from '@/actions/customerShippingAddressActions'
import FormModal from '@/components/common/FormModal'
import useModalControl from '@/hooks/useModalControl'
import handleServerAction from '@/lib/handleServerAction'
import { multilineNonEmptyRegex, nonEmptyRegex } from '@/lib/regex'

export default function CreateShippingAddressFormModal({
  refetchShippingAddress,
}) {
  const searchParams = useSearchParams()

  const customerId = useMemo(
    () => searchParams.get('viewShippingAddress') ?? '',
    [searchParams]
  )

  const { modalValue, handleCloseModal } = useModalControl(
    'createShippingAddress'
  )

  const {
    mutate: createCustomerShippingAddress,
    isPending: isCreateCustomerShippingAddressLoading,
  } = useMutation({
    mutationFn: (data) =>
      handleServerAction(createCustomerShippingAddressAction, data),
  })

  const createCustomerShippingAddressFormFields = useMemo(
    () => ({
      name: {
        type: 'input',
        label: 'Name',
        required: true,
        validator: (val) => nonEmptyRegex.test(val),
      },
      address: {
        type: 'input',
        label: 'Address',
        required: true,
        multiline: true,
        validator: (val) => multilineNonEmptyRegex.test(val),
      },
      gstin: {
        type: 'input',
        label: 'GSTIN',
      },
      emailId: {
        type: 'input',
        label: 'Email ID',
      },
      phoneNumber: {
        type: 'input',
        label: 'Phone Number',
      },
    }),
    []
  )

  const initialFormFieldValues = useMemo(
    () => ({
      name: '',
      address: '',
      gstin: '',
      emailId: '',
      phoneNumber: '',
    }),
    []
  )

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      createCustomerShippingAddress(
        {
          customerId,
          name: formFieldValues?.name?.trim(),
          address: formFieldValues?.address?.trim(),
          gstin: formFieldValues?.gstin?.trim(),
          emailId: formFieldValues?.emailId?.trim(),
          phoneNumber: formFieldValues?.phoneNumber?.trim(),
        },
        {
          onSuccess: async (data) => {
            enqueueSnackbar(data, { variant: 'success' })
            await refetchShippingAddress()
            handleCloseModal()
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    },
    [
      createCustomerShippingAddress,
      customerId,
      handleCloseModal,
      refetchShippingAddress,
    ]
  )

  return (
    <FormModal
      open={Boolean(modalValue)}
      title='Create Customer Shipping Address'
      formId='createCustomerShippingAddress'
      submitButtonLabel='Create'
      formFields={createCustomerShippingAddressFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isSubmitLoading={isCreateCustomerShippingAddressLoading}
      onSubmit={handleSubmit}
      onClose={handleCloseModal}
    />
  )
}
