'use client'

import { Box, Grid, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useMemo } from 'react'

import { getDocumentsAction } from '@/actions/dbActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import SearchBar from '@/components/common/SearchBar'
import CollectionSelector from '@/components/common/selectors/CollectionSelector'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'
import { parseJsonString } from '@/lib/utils/jsonUtils'
import { modelConstants } from '@/models/constants'

import DocumentsTableActions from './DocumentsTableActions'
import EditDocumentFormModal from './EditDocumentFormModal'

const documentTableColumns = {
  _id: {
    label: 'ID',
  },
  data: {
    label: 'Data',
    component: ({ data }) => JSON.stringify({ ...data, _id: undefined }),
    slotProps: {
      tableBodyCell: {
        className: 'truncate max-w-md',
      },
    },
  },
  actions: {
    label: 'Actions',
    component: DocumentsTableActions,
    slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  },
}

export default function Page() {
  const { getURL, searchParams } = useHandleSearchParams()

  const collectionName = useMemo(
    () => searchParams.get('collectionName') ?? '',
    [searchParams]
  )

  const pageNumber = useMemo(
    () => Number(searchParams.get('pageNumber')) || 0,
    [searchParams]
  )
  const pageSize = useMemo(
    () => Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE,
    [searchParams]
  )

  const filter = useMemo(
    () => parseJsonString(searchParams.get('filter')) ?? {},
    [searchParams]
  )

  const handleCollectionNameChange = useCallback(
    (val) => {
      window.history.replaceState(
        {},
        '',
        getURL({
          collectionName: val || null,
        })
      )
    },
    [getURL]
  )

  const {
    data: documentsResponse,
    isLoading: isDocumentsLoading,
    isError: isDocumentsError,
    error: documentsError,
    refetch: refetchDocuments,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getDocumentsAction, collectionName, {
        pageNumber,
        pageSize,
        filter,
      }),
    queryKey: [
      'getDocumentsAction',
      collectionName,
      pageNumber,
      pageSize,
      filter,
    ],
    enabled: Boolean(collectionName),
  })

  return (
    <>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Documents</Typography>
      </Box>
      <Grid container columnSpacing={2} columns={3} className='mb-2'>
        <Grid size={{ xs: 3, sm: 1 }}>
          <CollectionSelector
            ignoreCollections={[modelConstants.audit_log.collectionName]}
            selectedCollectionName={collectionName}
            setSelectedCollectionName={handleCollectionNameChange}
          />
        </Grid>
        <Grid size={{ xs: 3, sm: 2 }}>
          <SearchBar
            label='Filters'
            searchParamName='filter'
            validator={(filter) => filter === '' || parseJsonString(filter)}
          />
        </Grid>
      </Grid>
      <EditDocumentFormModal refetchDocuments={refetchDocuments} />
      {isDocumentsLoading && <TableSkeleton />}
      <ErrorAlert isError={isDocumentsError} error={documentsError}>
        <DataTable
          hidden={isDocumentsLoading}
          data={Object.fromEntries(
            documentsResponse?.paginatedResults?.map((auditLog) => [
              auditLog?._id,
              auditLog,
            ]) || []
          )}
          dataOrder={documentsResponse?.paginatedResults?.map(
            (document) => document?._id
          )}
          columns={documentTableColumns}
          totalCount={documentsResponse?.totalCount}
        />
      </ErrorAlert>
    </>
  )
}
