'use client'

import { Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'

import { getAuditLogsAction } from '@/actions/auditLogActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'

import { modelConstants } from '../../../../models/constants'
import AuditLogFilters from './AuditLogFilters'
import AuditLogTableActions from './AuditLogTableActions'
import ViewAuditLogUpdates from './ViewAuditLogUpdates'

const auditLogColumns = {
  collectionName: {
    label: 'Collection',
    component: ({ data }) => modelConstants?.[data?.collectionName]?.modelName,
  },
  documentId: { label: 'Document ID' },
  type: { label: 'Type' },
  updatedBy: {
    label: 'Updated By',
    component: ({ data }) => data?.updatedBy?.[0]?.name,
  },
  updatedAt: {
    label: 'Updated At',
    component: ({ data }) => data?.updatedAt?.toLocaleString(),
  },
  actions: {
    label: 'Actions',
    component: AuditLogTableActions,
    slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  },
}

export default function Page() {
  const { searchParams } = useHandleSearchParams()

  const collectionName = useMemo(
    () => searchParams.get('collectionName') ?? '',
    [searchParams]
  )
  const documentId = useMemo(
    () => searchParams.get('documentId') ?? '',
    [searchParams]
  )
  const updateType = useMemo(
    () => searchParams.get('updateType') ?? '',
    [searchParams]
  )
  const updatedById = useMemo(
    () => searchParams.get('updatedById') ?? '',
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
  const startDateTime = useMemo(
    () => Number(searchParams.get('startDateTime')),
    [searchParams]
  )
  const endDateTime = useMemo(
    () => Number(searchParams.get('endDateTime')),
    [searchParams]
  )

  const {
    data: auditLogResponse,
    isLoading: isAuditLogLoading,
    isError: isAuditLogError,
    error: auditLogError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getAuditLogsAction, {
        pageNumber,
        pageSize,
        collectionName,
        documentId,
        updateType,
        updatedById,
        startDateTime,
        endDateTime,
      }),
    queryKey: [
      'getAuditLogsAction',
      pageNumber,
      pageSize,
      collectionName,
      documentId,
      updateType,
      updatedById,
      startDateTime,
      endDateTime,
    ],
  })

  return (
    <>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Audit Logs</Typography>
      </Box>
      <AuditLogFilters />
      <ViewAuditLogUpdates />
      {isAuditLogLoading && <TableSkeleton />}
      <ErrorAlert isError={isAuditLogError} error={auditLogError}>
        <DataTable
          hidden={isAuditLogLoading}
          data={Object.fromEntries(
            auditLogResponse?.paginatedResults?.map((auditLog) => [
              auditLog?._id,
              auditLog,
            ]) || []
          )}
          dataOrder={auditLogResponse?.paginatedResults?.map(
            (user) => user?._id
          )}
          columns={auditLogColumns}
          totalCount={auditLogResponse?.totalCount}
        />
      </ErrorAlert>
    </>
  )
}
