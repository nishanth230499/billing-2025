'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { addCustomerAction, getCustomerAction } from '@/actions/customerActions'
import { AppContext } from '@/app/ClientProviders'
import FormModal from '@/components/common/FormModal'
import CustomerSelector from '@/components/common/selectors/CustomerSelector'
import useModalControl from '@/hooks/useModalControl'
import handleServerAction from '@/lib/handleServerAction'
import { multilineNonEmptyRegex, nonEmptyRegex } from '@/lib/regex'

export default function AddExistingCustomerFormModal({ refetchCustomers }) {
  const params = useParams()
  const { appConfig } = useContext(AppContext)

  const stockCycleId = params.stockCycle

  const { modalValue, handleCloseModal } = useModalControl('add')

  const { CUSTOMER_ID_REGEX, STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS } = appConfig

  const [selectedCustomerId, setSelectedCustomerId] = useState('')

  useEffect(() => {
    if (!modalValue) setSelectedCustomerId('')
  }, [modalValue])

  const {
    data: customerResponse,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
    error: customerError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCustomerAction, selectedCustomerId, ''),
    queryKey: ['getCustomerAction', selectedCustomerId],
    enabled: Boolean(selectedCustomerId),
  })

  const { mutate: addCustomer, isPending: isAddCustomerLoading } = useMutation({
    mutationFn: (data) => handleServerAction(addCustomerAction, ...data),
  })

  const additionalFields = useMemo(
    () => ({
      billingName: {
        type: 'input',
        label: 'Billing Name',
        required: true,
        validator: (val) => nonEmptyRegex.test(val),
      },
      billingAddress: {
        type: 'input',
        label: 'Billing Address',
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

  const addCustomerFormFields = useMemo(
    () => ({
      id: {
        type: 'custom',
        component: ({ value, onChange, error }) => (
          <CustomerSelector
            required
            error={error}
            filter={{ stockCycle: { id: stockCycleId, not: true } }}
            selectedCustomerId={value}
            setSelectedCustomerId={(val) => {
              onChange(val)
              setSelectedCustomerId(val)
            }}
            customerResponse={customerResponse}
          />
        ),
        validator: (val) => new RegExp(CUSTOMER_ID_REGEX).test(val),
      },
      ...(STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.length
        ? {
            noteDivider: {
              type: 'divider',
              size: 12,
            },
            note: {
              type: 'text',
              size: 12,
              text: 'The following fields are specific to the selected Stock Cycle',
            },
            ...Object.fromEntries(
              Object.entries(additionalFields).filter(([fieldName]) =>
                STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.includes(fieldName)
              )
            ),
          }
        : {}),
    }),
    [
      CUSTOMER_ID_REGEX,
      STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS,
      additionalFields,
      customerResponse,
      stockCycleId,
    ]
  )

  const initialFormFieldValues = useMemo(
    () => ({
      id: selectedCustomerId,
      billingName: customerResponse?.billingName ?? '',
      billingAddress: customerResponse?.billingAddress ?? '',
      gstin: customerResponse?.gstin ?? '',
      emailId: customerResponse?.emailId ?? '',
      phoneNumber: customerResponse?.phoneNumber ?? '',
    }),
    [
      customerResponse?.billingAddress,
      customerResponse?.billingName,
      customerResponse?.emailId,
      customerResponse?.gstin,
      customerResponse?.phoneNumber,
      selectedCustomerId,
    ]
  )

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      addCustomer(
        [
          formFieldValues?.id,
          {
            stockCycleId,
            billingName: formFieldValues?.billingName?.trim(),
            billingAddress: formFieldValues?.billingAddress?.trim(),
            gstin: formFieldValues?.gstin?.trim(),
            emailId: formFieldValues?.emailId?.trim(),
            phoneNumber: formFieldValues?.phoneNumber?.trim(),
          },
        ],
        {
          onSuccess: async (data) => {
            enqueueSnackbar(data, { variant: 'success' })
            await refetchCustomers()
            handleCloseModal()
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    },
    [addCustomer, stockCycleId, refetchCustomers, handleCloseModal]
  )

  return (
    <FormModal
      open={Boolean(modalValue)}
      title='Add Existing Customer'
      formId='addExistingCustomer'
      submitButtonLabel='Add'
      formFields={addCustomerFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isError={isCustomerError}
      error={customerError}
      isFormLoading={isCustomerLoading}
      isSubmitLoading={isAddCustomerLoading}
      onSubmit={handleSubmit}
      onClose={handleCloseModal}
    />
  )
}
