'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useMemo } from 'react'

import { editDocumentAction, getDocumentAction } from '@/actions/dbActions'
import FormModal from '@/components/common/FormModal'
import useModalControl from '@/hooks/useModalControl'
import handleServerAction from '@/lib/handleServerAction'
import { parseJsonString } from '@/lib/utils/jsonUtils'
import { modelConstants } from '@/models/constants'

export default function EditDocumentFormModal({ refetchDocuments }) {
  const searchParams = useSearchParams()

  const collectionName = useMemo(
    () => searchParams.get('collectionName') ?? '',
    [searchParams]
  )

  const { modalValue: editingDocumentId, handleCloseModal } =
    useModalControl('editDocument')

  const {
    data: documentResponse,
    isLoading: isDocumentLoading,
    isError: isDocumentError,
    error: documentError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(
        getDocumentAction,
        collectionName,
        editingDocumentId
      ),
    queryKey: ['getDocumentAction', collectionName, editingDocumentId],
    enabled: Boolean(collectionName) && Boolean(editingDocumentId),
  })

  const { mutate: editDocument, isPending: isEditDocumentLoading } =
    useMutation({
      mutationFn: (data) => handleServerAction(editDocumentAction, ...data),
    })

  const editDocumentFormFields = useMemo(
    () => ({
      collectionName: {
        type: 'text',
        text: (
          <>
            Collection:{' '}
            <b>{modelConstants?.[collectionName]?.modelName ?? ''}</b>
          </>
        ),
      },
      ID: {
        type: 'text',
        text: (
          <>
            ID: <b>{editingDocumentId ?? ''}</b>
          </>
        ),
      },
      data: {
        type: 'input',
        label: 'Data',
        required: true,
        multiline: true,
        size: 12,
        fontFamily: 'monospace',
        validator: (val) => Boolean(parseJsonString(val)),
      },
    }),
    [collectionName, editingDocumentId]
  )

  const initialFormFieldValues = useMemo(
    () => ({
      data: JSON.stringify(
        { ...(documentResponse ?? {}), _id: undefined },
        null,
        2
      ),
    }),
    [documentResponse]
  )

  const handleSubmit = useCallback(
    async (formFieldValues) => {
      editDocument(
        [
          collectionName,
          editingDocumentId,
          parseJsonString(formFieldValues?.data),
        ],
        {
          onSuccess: async (data) => {
            enqueueSnackbar(data, { variant: 'success' })
            await refetchDocuments()
            handleCloseModal()
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    },
    [
      collectionName,
      editDocument,
      editingDocumentId,
      handleCloseModal,
      refetchDocuments,
    ]
  )

  return (
    <FormModal
      open={Boolean(editingDocumentId)}
      title='Edit Document'
      formId='editDocument'
      submitButtonLabel='Save'
      formFields={editDocumentFormFields}
      initialFormFieldValues={initialFormFieldValues}
      isError={isDocumentError}
      error={documentError}
      isFormLoading={isDocumentLoading}
      isSubmitLoading={isEditDocumentLoading}
      onSubmit={handleSubmit}
      onClose={handleCloseModal}
    />
  )
}
