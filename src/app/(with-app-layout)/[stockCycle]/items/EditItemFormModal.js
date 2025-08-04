'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useMemo } from 'react'

import { editItemAction, getItemAction } from '@/actions/itemsActions'
import FormModal from '@/components/common/FormModal'
import HsnSelector from '@/components/common/selectors/HsnSelector'
import useModalControl from '@/hooks/useModalControl'
import handleServerAction from '@/lib/handleServerAction'
import { amountRegex, nonEmptyRegex } from '@/lib/regex'

export default function EditItemFormModal({ refetchItems }) {
  const { modalValue: editingItemId, handleCloseModal } =
    useModalControl('editItem')

  const {
    data: itemResponse,
    isLoading: isItemLoading,
    isError: isItemError,
    error: itemError,
  } = useQuery({
    queryFn: async () => await handleServerAction(getItemAction, editingItemId),
    queryKey: ['getItemAction', editingItemId],
    enabled: Boolean(editingItemId),
  })

  const { mutate: editItem, isPending: isEditItemLoading } = useMutation({
    mutationFn: (data) => handleServerAction(editItemAction, ...data),
  })

  const editItemFormFields = useMemo(
    () => ({
      company: {
        type: 'text',
        text: (
          <>
            Company Short Name: <b>{itemResponse?.company?.shortName ?? ''}</b>
          </>
        ),
      },
      id: {
        type: 'text',
        text: (
          <>
            ID: <b>{itemResponse?._id ?? ''}</b>
          </>
        ),
      },
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
    [itemResponse?._id, itemResponse?.company?.shortName]
  )

  const initialFormFieldValues = useMemo(
    () => ({
      name: itemResponse?.name ?? '',
      group: itemResponse?.group ?? '',
      price: itemResponse?.price?.toFixed(2) ?? '',
      tags: itemResponse?.tags ?? [],
      hsnId: itemResponse?.hsnId ?? '',
    }),
    [
      itemResponse?.group,
      itemResponse?.hsnId,
      itemResponse?.name,
      itemResponse?.price,
      itemResponse?.tags,
    ]
  )

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      editItem(
        [
          editingItemId,
          {
            name: formFieldValues?.name?.trim(),
            group: formFieldValues?.group?.trim(),
            price: formFieldValues?.price
              ? parseFloat(formFieldValues?.price)
              : undefined,
            tags: formFieldValues?.tags?.map((tag) => tag.trim()) ?? [],
            hsnId: formFieldValues?.hsnId,
          },
        ],
        {
          onSuccess: async (data) => {
            enqueueSnackbar(data, { variant: 'success' })
            await refetchItems()
            handleCloseModal()
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    },
    [editItem, editingItemId, handleCloseModal, refetchItems]
  )

  return (
    <FormModal
      open={Boolean(editingItemId)}
      title='Edit Item'
      formId='editItem'
      submitButtonLabel='Save'
      formFields={editItemFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isError={isItemError}
      error={itemError}
      isFormLoading={isItemLoading}
      isSubmitLoading={isEditItemLoading}
      onSubmit={handleSubmit}
      onClose={handleCloseModal}
    />
  )
}
