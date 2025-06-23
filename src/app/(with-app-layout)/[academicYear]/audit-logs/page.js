'use client'

import { Alert, Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'

import DataTable from '@/components/common/DataTable'
import Modal from '@/components/common/Modal'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'

import { getAuditLogsAction } from '../../../../actions/auditLogActions'
import UserSelector from '../../../../components/common/UserSelector'
import AuditLogTableActions from './AuditLogTableActions'
import ViewAuditLogUpdates from './ViewAuditLogUpdates'

const auditLogColumns = {
  collectionName: { label: 'Table' },
  documentId: { label: 'ID' },
  updatedBy: {
    label: 'Updated By',
    component: ({ data }) => data?.updatedBy?.[0]?.name,
  },
  updatedAt: {
    label: 'Updated At',
    component: ({ data }) => data?.updatedAt?.toLocaleString(),
  },
  type: { label: 'Type' },
  actions: {
    label: 'Actions',
    component: AuditLogTableActions,
    slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  },
}

export default function Page() {
  const { searchParams } = useHandleSearchParams()

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
        updatedById,
      }),
    queryKey: [pageNumber, pageSize, updatedById],
  })

  return (
    <>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Audit Logs</Typography>
      </Box>
      <Box>
        <UserSelector />
      </Box>
      <Modal openSearchParamKey='view_audit_log_updates' title='Updates'>
        <ViewAuditLogUpdates />
      </Modal>
      {isAuditLogLoading && <TableSkeleton />}
      {isAuditLogError ? (
        <Alert severity='error'>{auditLogError.message}</Alert>
      ) : (
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
      )}
    </>
  )
}
