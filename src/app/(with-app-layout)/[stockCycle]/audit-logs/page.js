'use client'

import { Box, Paper, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'

import { getAuditLogsAction } from '@/actions/auditLogActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import TableSkeleton from '@/components/TableSkeleton'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import usePaginationControl from '@/hooks/usePaginationControl'
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
    component: ({ data }) => new Date(data?.updatedAt).toLocaleString(),
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

  const startDateTime = useMemo(
    () => searchParams.get('startDateTime') ?? '',
    [searchParams]
  )
  const endDateTime = useMemo(
    () => searchParams.get('endDateTime') ?? '',
    [searchParams]
  )

  const paginationProps = usePaginationControl()

  const {
    data: auditLogResponse,
    isLoading: isAuditLogLoading,
    isError: isAuditLogError,
    error: auditLogError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getAuditLogsAction, {
        pageNumber: paginationProps?.pageNumber,
        pageSize: paginationProps?.pageSize,
        collectionName,
        documentId,
        updateType,
        updatedById,
        startDateTime,
        endDateTime,
      }),
    queryKey: [
      'getAuditLogsAction',
      paginationProps?.pageNumber,
      paginationProps?.pageSize,
      collectionName,
      documentId,
      updateType,
      updatedById,
      startDateTime,
      endDateTime,
    ],
  })

  return (
    <Paper className='overflow-auto h-full flex flex-col p-4'>
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
          paginationProps={{
            ...paginationProps,
            totalCount: auditLogResponse?.totalCount,
          }}
        />
      </ErrorAlert>
    </Paper>
  )
}
