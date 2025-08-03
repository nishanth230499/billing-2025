'use client'

import { InputAdornment } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useContext, useMemo } from 'react'

import { createItemAction } from '@/actions/itemsActions'
import { AppContext } from '@/app/ClientProviders'
import FormModal from '@/components/common/FormModal'
import CompanySelector from '@/components/common/selectors/CompanySelector'
import HsnSelector from '@/components/common/selectors/HsnSelector'
import handleServerAction from '@/lib/handleServerAction'
import { amountRegex, nonEmptyRegex } from '@/lib/regex'

export default function CreateItemFormModal({ refetchItems }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { appConfig } = useContext(AppContext)

  const isModalOpen = useMemo(
    () => Boolean(searchParams.get('create')),
    [searchParams]
  )

  const {
    AUTO_GENERATE_COMPANY_ID,
    ITEM_CODE_REGEX,
    COMPANY_ID_ITEM_ID_DELIM,
    AUTO_INCREMENT_ITEM_CODE,
  } = appConfig

  const { mutate: createItem, isPending: isCreateItemLoading } = useMutation({
    mutationFn: (data) => handleServerAction(createItemAction, data),
  })

  const createItemFormFields = useMemo(
    () => ({
      companyId: {
        type: 'custom',
        component: ({ value, onChange, error, required }) => (
          <CompanySelector
            selectedCompanyId={value}
            setSelectedCompanyId={onChange}
            required={required}
            error={error}
          />
        ),
        required: true,
        validator: (val) => nonEmptyRegex.test(val),
      },
      ...(AUTO_GENERATE_COMPANY_ID
        ? {}
        : {
            ...(AUTO_INCREMENT_ITEM_CODE
              ? {
                  autoIncrement: {
                    type: 'switch',
                    label: 'Auto Increment ID',
                    validator: (value, values) => ({
                      code:
                        value || new RegExp(ITEM_CODE_REGEX).test(values?.code),
                    }),
                  },
                }
              : {}),
            code: {
              type: 'input',
              label: 'ID',
              autoFocus: true,
              required: true,
              hidden: (_, values) => values?.autoIncrement,
              startAdornment: COMPANY_ID_ITEM_ID_DELIM
                ? (_, values) => (
                    <InputAdornment position='start'>
                      {values?.companyId}
                      {COMPANY_ID_ITEM_ID_DELIM}
                    </InputAdornment>
                  )
                : undefined,
              validator: (value, values) =>
                values?.autoIncrement ||
                new RegExp(ITEM_CODE_REGEX).test(value),
            },
          }),
      name: {
        type: 'input',
        label: 'Name',
        required: true,
        validator: (val) => nonEmptyRegex.test(val),
      },
      group: {
        type: 'input',
        label: 'Group',
      },
      price: {
        type: 'input',
        label: 'Price',
        validator: (val) => !val || amountRegex.test(val),
      },
      tags: {
        type: 'tags',
        label: 'Tags',
      },
      hsnId: {
        type: 'custom',
        component: ({ value, onChange, error, required }) => (
          <HsnSelector
            selectedHsnId={value}
            setSelectedHsnId={onChange}
            required={required}
            error={error}
          />
        ),
        required: true,
        validator: (val) => nonEmptyRegex.test(val),
      },
    }),
    [
      AUTO_GENERATE_COMPANY_ID,
      AUTO_INCREMENT_ITEM_CODE,
      COMPANY_ID_ITEM_ID_DELIM,
      ITEM_CODE_REGEX,
    ]
  )

  const initialFormFieldValues = useMemo(
    () => ({
      companyId: '',
      code: '',
      name: '',
      group: '',
      price: '',
      tags: [],
      hsnId: '',
    }),
    []
  )

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      createItem(
        {
          code: formFieldValues?.autoIncrement
            ? undefined
            : formFieldValues?.code,
          name: formFieldValues?.name?.trim(),
          group: formFieldValues?.group?.trim(),
          price: formFieldValues?.price
            ? parseFloat(formFieldValues?.price)
            : undefined,
          tags: formFieldValues?.tags?.map((tag) => tag.trim()) ?? [],
          companyId: formFieldValues?.companyId,
          hsnId: formFieldValues?.hsnId,
        },
        {
          onSuccess: async (data) => {
            enqueueSnackbar(data, { variant: 'success' })
            await refetchItems()
            router.back()
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    },
    [createItem, refetchItems, router]
  )

  return (
    <FormModal
      open={isModalOpen}
      title='Create Item'
      formId='createItem'
      submitButtonLabel='Create'
      formFields={createItemFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isSubmitLoading={isCreateItemLoading}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  )
}
