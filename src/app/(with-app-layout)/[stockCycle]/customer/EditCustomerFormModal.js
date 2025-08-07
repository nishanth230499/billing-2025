'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useContext, useMemo } from 'react'

import {
  editCustomerAction,
  getCustomerAction,
} from '@/actions/customerActions'
import { AppContext } from '@/app/ClientProviders'
import FormModal from '@/components/common/FormModal'
import useModalControl from '@/hooks/useModalControl'
import handleServerAction from '@/lib/handleServerAction'
import {
  multilineNonEmptyRegex,
  negativeAmountRegex,
  nonEmptyRegex,
} from '@/lib/regex'
import { formatAmount } from '@/lib/utils/amoutUtils'

export default function EditCustomerFormModal({ refetchCustomers }) {
  const params = useParams()
  const { appConfig } = useContext(AppContext)

  const stockCycleId = params.stockCycle

  const { modalValue: editingCustomerId, handleCloseModal } =
    useModalControl('editCustomer')

  const {
    IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
    STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS,
  } = appConfig

  const {
    data: customerResponse,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
    error: customerError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(
        getCustomerAction,
        editingCustomerId,
        stockCycleId
      ),
    queryKey: ['getCustomerAction', editingCustomerId, stockCycleId],
    enabled: Boolean(editingCustomerId),
  })

  const { mutate: editCustomer, isPending: isEditCustomerLoading } =
    useMutation({
      mutationFn: (data) => handleServerAction(editCustomerAction, ...data),
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

  const editCustomerFormFields = useMemo(
    () => ({
      id: {
        type: 'text',
        text: (
          <>
            ID: <b>{customerResponse?._id ?? ''}</b>
          </>
        ),
      },
      firmId: {
        type: 'text',
        text: (
          <>
            Firm: <b>{customerResponse?.firm?.name ?? ''}</b>
          </>
        ),
      },
      name: {
        type: 'input',
        label: 'Name',
        required: true,
        validator: (val) => nonEmptyRegex.test(val),
      },
      place: {
        type: 'input',
        label: 'Place',
        required: true,
        validator: (val) => nonEmptyRegex.test(val),
      },
      openingBalance: {
        type: 'input',
        label: 'Opening Balance',
        required: true,
        validator: (val) => negativeAmountRegex.test(val),
      },
      ...Object.fromEntries(
        Object.entries(additionalFields).filter(
          ([fieldName]) =>
            !STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.includes(fieldName)
        )
      ),
      ...(IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE &&
      STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.length
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
          }
        : {}),
      ...Object.fromEntries(
        Object.entries(additionalFields).filter(([fieldName]) =>
          STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.includes(fieldName)
        )
      ),
    }),
    [
      IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
      STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS,
      additionalFields,
      customerResponse?._id,
      customerResponse?.firm?.name,
    ]
  )

  const initialFormFieldValues = useMemo(
    () => ({
      name: customerResponse?.name,
      place: customerResponse?.place,
      openingBalance: formatAmount(customerResponse?.openingBalance) ?? '',
      billingName: customerResponse?.billingName,
      billingAddress: customerResponse?.billingAddress,
      gstin: customerResponse?.gstin,
      emailId: customerResponse?.emailId,
      phoneNumber: customerResponse?.phoneNumber,
    }),
    [
      customerResponse?.billingAddress,
      customerResponse?.billingName,
      customerResponse?.emailId,
      customerResponse?.gstin,
      customerResponse?.name,
      customerResponse?.openingBalance,
      customerResponse?.phoneNumber,
      customerResponse?.place,
    ]
  )

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      editCustomer(
        [
          editingCustomerId,
          {
            name: formFieldValues?.name?.trim(),
            place: formFieldValues?.place?.trim(),
            firmId: formFieldValues?.firmId,
            openingBalance: formFieldValues?.openingBalance,
            stockCycleId: IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE
              ? stockCycleId
              : undefined,
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
    [
      editCustomer,
      editingCustomerId,
      IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
      stockCycleId,
      refetchCustomers,
      handleCloseModal,
    ]
  )

  return (
    <FormModal
      open={Boolean(editingCustomerId)}
      title='Edit Customer'
      formId='editCustomer'
      submitButtonLabel='Save'
      formFields={editCustomerFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isError={isCustomerError}
      error={customerError}
      isFormLoading={isCustomerLoading}
      isSubmitLoading={isEditCustomerLoading}
      onSubmit={handleSubmit}
      onClose={handleCloseModal}
    />
  )
}
