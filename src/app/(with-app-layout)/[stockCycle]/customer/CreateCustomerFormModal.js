'use client'

import { useMutation } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useContext, useMemo } from 'react'

import { createCustomerAction } from '@/actions/customerActions'
import { AppContext } from '@/app/ClientProviders'
import FormModal from '@/components/common/FormModal'
import FirmSelector from '@/components/common/selectors/FirmSelector'
import useModalControl from '@/hooks/useModalControl'
import handleServerAction from '@/lib/handleServerAction'
import {
  multilineNonEmptyRegex,
  negativeAmountRegex,
  nonEmptyRegex,
} from '@/lib/regex'

export default function CreateCustomerFormModal({ refetchCustomers }) {
  const params = useParams()

  const { appConfig } = useContext(AppContext)

  const stockCycleId = params.stockCycle

  const { modalValue, handleCloseModal } = useModalControl('create')

  const {
    AUTO_GENERATE_CUSTOMER_ID,
    CUSTOMER_ID_REGEX,
    IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
    STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS,
  } = appConfig

  const { mutate: createCustomer, isPending: isCreateCustomerLoading } =
    useMutation({
      mutationFn: (data) => handleServerAction(createCustomerAction, data),
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

  const createCustomerFormFields = useMemo(
    () => ({
      ...(AUTO_GENERATE_CUSTOMER_ID
        ? {}
        : {
            id: {
              type: 'input',
              label: 'ID',
              autoFocus: true,
              required: true,
              validator: (val) => new RegExp(CUSTOMER_ID_REGEX).test(val),
            },
          }),

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
      AUTO_GENERATE_CUSTOMER_ID,
      CUSTOMER_ID_REGEX,
      IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
      STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS,
      additionalFields,
    ]
  )

  const initialFormFieldValues = useMemo(
    () => ({
      id: '',
      name: '',
      place: '',
      openingBalance: '0.00',
      firmId: '',
      billingName: '',
      billingAddress: '',
      gstin: '',
      emailId: '',
      phoneNumber: '',
    }),
    []
  )

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      createCustomer(
        {
          _id: formFieldValues?.id,
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
      createCustomer,
      IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
      stockCycleId,
      refetchCustomers,
      handleCloseModal,
    ]
  )

  return (
    <FormModal
      open={Boolean(modalValue)}
      title='Create Customer'
      formId='createCustomer'
      submitButtonLabel='Create'
      formFields={createCustomerFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isSubmitLoading={isCreateCustomerLoading}
      onSubmit={handleSubmit}
      onClose={handleCloseModal}
    />
  )
}
