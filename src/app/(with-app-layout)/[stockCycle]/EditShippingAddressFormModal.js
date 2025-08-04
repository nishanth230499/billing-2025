'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useMemo } from 'react'

import {
  editCustomerShippingAddressAction,
  getCustomerShippingAddressAction,
} from '@/actions/customerShippingAddressActions'
import FormModal from '@/components/common/FormModal'
import handleServerAction from '@/lib/handleServerAction'
import { multilineNonEmptyRegex, nonEmptyRegex } from '@/lib/regex'

export default function EditCustomerShippingAddressFormModal({
  refetchShippingAddress,
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const editingShippingAddressId = useMemo(
    () => searchParams.get('editShippingAddress'),
    [searchParams]
  )

  const {
    data: customerShippingAddressResponse,
    isLoading: isCustomerShippingAddressLoading,
    isError: isCustomerShippingAddressError,
    error: customerShippingAddressError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(
        getCustomerShippingAddressAction,
        editingShippingAddressId
      ),
    queryKey: ['getCustomerShippingAddressAction', editingShippingAddressId],
    enabled: Boolean(editingShippingAddressId),
  })

  const {
    mutate: editCustomerShippingAddress,
    isPending: isEditCustomerShippingAddressLoading,
  } = useMutation({
    mutationFn: (data) =>
      handleServerAction(editCustomerShippingAddressAction, ...data),
  })

  const editCustomerShippingAddressFormFields = useMemo(
    () => ({
      id: {
        type: 'text',
        text: (
          <>
            ID: <b>{customerShippingAddressResponse?._id ?? ''}</b>
          </>
        ),
      },
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
    [customerShippingAddressResponse?._id]
  )

  const initialFormFieldValues = useMemo(
    () => ({
      name: customerShippingAddressResponse?.name,
      address: customerShippingAddressResponse?.address,
      gstin: customerShippingAddressResponse?.gstin,
      emailId: customerShippingAddressResponse?.emailId,
      phoneNumber: customerShippingAddressResponse?.phoneNumber,
    }),
    [
      customerShippingAddressResponse?.address,
      customerShippingAddressResponse?.emailId,
      customerShippingAddressResponse?.gstin,
      customerShippingAddressResponse?.name,
      customerShippingAddressResponse?.phoneNumber,
    ]
  )

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      editCustomerShippingAddress(
        [
          editingShippingAddressId,
          {
            name: formFieldValues?.name?.trim(),
            address: formFieldValues?.address?.trim(),
            gstin: formFieldValues?.gstin?.trim(),
            emailId: formFieldValues?.emailId?.trim(),
            phoneNumber: formFieldValues?.phoneNumber?.trim(),
          },
        ],
        {
          onSuccess: async (data) => {
            enqueueSnackbar(data, { variant: 'success' })
            await refetchShippingAddress()
            router.back()
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    },
    [
      editCustomerShippingAddress,
      editingShippingAddressId,
      refetchShippingAddress,
      router,
    ]
  )

  return (
    <FormModal
      open={Boolean(editingShippingAddressId)}
      title='Edit Customer Shipping Address'
      formId='editCustomerShippingAddress'
      submitButtonLabel='Save'
      formFields={editCustomerShippingAddressFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isError={isCustomerShippingAddressError}
      error={customerShippingAddressError}
      isFormLoading={isCustomerShippingAddressLoading}
      isSubmitLoading={isEditCustomerShippingAddressLoading}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  )
}
