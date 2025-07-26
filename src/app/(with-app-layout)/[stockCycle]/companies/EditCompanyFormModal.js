'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useMemo } from 'react'

import { editCompanyAction, getCompanyAction } from '@/actions/companyActions'
import FormModal from '@/components/common/FormModal'
import handleServerAction from '@/lib/handleServerAction'
import { multilineNonEmptyRegex, nonEmptyRegex } from '@/lib/regex'

export default function EditCompanyFormModal({ refetchCompanies }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const editingCompanyId = useMemo(
    () => searchParams.get('editCompany'),
    [searchParams]
  )

  const {
    data: companyResponse,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
    error: companyError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCompanyAction, editingCompanyId),
    queryKey: ['getCustomerAction', editingCompanyId],
    enabled: Boolean(editingCompanyId),
  })

  const { mutate: editCompany, isPending: isEditCompanyLoading } = useMutation({
    mutationFn: (data) => handleServerAction(editCompanyAction, ...data),
  })

  const editCompanyFormFields = useMemo(
    () => ({
      id: {
        type: 'text',
        text: (
          <>
            ID: <b>{companyResponse?._id ?? ''}</b>
          </>
        ),
      },
      firmId: {
        type: 'text',
        text: (
          <>
            Firm: <b>{companyResponse?.firm?.name ?? ''}</b>
          </>
        ),
      },
      name: {
        type: 'input',
        label: 'Name',
        required: true,
        validator: (val) => nonEmptyRegex.test(val),
      },
      shortName: {
        type: 'input',
        label: 'Short Name',
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
        label: 'GST IN',
      },
      phoneNumber: {
        type: 'input',
        label: 'Phone Number',
      },
      emailId: {
        type: 'input',
        label: 'Email ID',
      },
      shippingAddress: {
        type: 'input',
        label: 'Shipping Address',
        multiline: true,
      },
      shippingPhoneNumber: {
        type: 'input',
        label: 'Shipping Phone Number',
      },
      tags: {
        type: 'tags',
        label: 'Tags',
      },
    }),
    [companyResponse?._id, companyResponse?.firm?.name]
  )

  const initialFormFieldValues = useMemo(
    () => ({
      name: companyResponse?.name,
      shortName: companyResponse?.shortName,
      address: companyResponse?.address,
      gstin: companyResponse?.gstin,
      phoneNumber: companyResponse?.phoneNumber,
      emailId: companyResponse?.emailId,
      shippingAddress: companyResponse?.shippingAddress,
      shippingPhoneNumber: companyResponse?.shippingPhoneNumber,
      tags: companyResponse?.tags ?? [],
    }),
    [
      companyResponse?.address,
      companyResponse?.emailId,
      companyResponse?.gstin,
      companyResponse?.name,
      companyResponse?.phoneNumber,
      companyResponse?.shippingAddress,
      companyResponse?.shippingPhoneNumber,
      companyResponse?.shortName,
      companyResponse?.tags,
    ]
  )

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      editCompany(
        [
          editingCompanyId,
          {
            name: formFieldValues?.name?.trim(),
            shortName: formFieldValues?.shortName?.trim(),
            address: formFieldValues?.address?.trim(),
            gstin: formFieldValues?.gstin?.trim(),
            phoneNumber: formFieldValues?.phoneNumber?.trim(),
            emailId: formFieldValues?.emailId?.trim(),
            shippingAddress: formFieldValues?.shippingAddress?.trim(),
            shippingPhoneNumber: formFieldValues?.shippingPhoneNumber?.trim(),
            tags: formFieldValues?.tags?.map((tag) => tag.trim()) ?? [],
          },
        ],
        {
          onSuccess: async (data) => {
            enqueueSnackbar(data, { variant: 'success' })
            await refetchCompanies()
            router.back()
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    },
    [editCompany, editingCompanyId, refetchCompanies, router]
  )

  return (
    <FormModal
      open={Boolean(editingCompanyId)}
      title='Edit Customer'
      formId='editCustomer'
      submitButtonLabel='Save'
      formFields={editCompanyFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isError={isCompanyError}
      error={companyError}
      isFormLoading={isCompanyLoading}
      isSubmitLoading={isEditCompanyLoading}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  )
}
