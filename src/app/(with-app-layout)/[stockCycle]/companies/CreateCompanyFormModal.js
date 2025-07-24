'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useContext, useMemo } from 'react'

import { createCompanyAction } from '@/actions/companyActions'
import { AppContext } from '@/app/ClientProviders'
import FormModal from '@/components/common/FormModal'
import FirmSelector from '@/components/common/selectors/FirmSelector'
import handleServerAction from '@/lib/handleServerAction'
import { multilineNonEmptyRegex, nonEmptyRegex } from '@/lib/regex'

export default function CreateCompanyFormModal({ refetchCompanies }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { appConfig } = useContext(AppContext)

  const isModalOpen = useMemo(
    () => Boolean(searchParams.get('create')),
    [searchParams]
  )

  const { AUTO_GENERATE_COMPANY_ID, COMPANY_ID_REGEX } = appConfig

  const { mutate: createCompany, isPending: isCreateCompanyLoading } =
    useMutation({
      mutationFn: (data) => handleServerAction(createCompanyAction, data),
    })

  const createCompanyFormFields = useMemo(
    () => ({
      ...(AUTO_GENERATE_COMPANY_ID
        ? {}
        : {
            id: {
              type: 'input',
              label: 'ID',
              autoFocus: true,
              required: true,
              validator: (val) => new RegExp(COMPANY_ID_REGEX).test(val),
            },
          }),
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
      firmId: {
        type: 'custom',
        component: ({ value, onChange, error }) => (
          <FirmSelector
            selectedFirmId={value}
            setSelectedFirmId={onChange}
            required
            error={error}
          />
        ),
        validator: (val) => nonEmptyRegex.test(val),
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
    [AUTO_GENERATE_COMPANY_ID, COMPANY_ID_REGEX]
  )

  const initialFormFieldValues = useMemo(
    () => ({
      id: '',
      name: '',
      shortName: '',
      address: '',
      firmId: '',
      gstin: '',
      phoneNumber: '',
      emailId: '',
      shippingAddress: '',
      shippingPhoneNumber: '',
      tags: new Set(),
    }),
    []
  )

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      createCompany(
        {
          _id: formFieldValues?.id,
          name: formFieldValues?.name?.trim(),
          shortName: formFieldValues?.shortName?.trim(),
          address: formFieldValues?.address?.trim(),
          firmId: formFieldValues?.firmId,
          gstin: formFieldValues?.gstin?.trim(),
          phoneNumber: formFieldValues?.phoneNumber?.trim(),
          emailId: formFieldValues?.emailId?.trim(),
          shippingAddress: formFieldValues?.shippingAddress?.trim(),
          shippingPhoneNumber: formFieldValues?.shippingPhoneNumber?.trim(),
          tags:
            [...(formFieldValues?.tags ?? [])]?.map((tag) => tag?.trim()) ?? [],
        },
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
    [createCompany, refetchCompanies, router]
  )

  return (
    <FormModal
      open={isModalOpen}
      title='Create Company'
      formId='createCompany'
      submitButtonLabel='Create'
      formFields={createCompanyFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isSubmitLoading={isCreateCompanyLoading}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  )
}
