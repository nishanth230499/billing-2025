'use client'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Alert,
  Box,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'

import { getAuditLogsAction } from '@/actions/auditLogActions'
import DataTable from '@/components/common/DataTable'
import Modal from '@/components/common/Modal'
import CollectionSelector from '@/components/common/selectors/CollectionSelector'
import DateSelector from '@/components/common/selectors/DateSelector'
import UserSelector from '@/components/common/selectors/UserSelector'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'
import { modelConstants } from '@/models/constants'

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
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const collectionName = useMemo(
    () => searchParams.get('collectionName') ?? '',
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

  const appliedFiltersCount = useMemo(
    () =>
      [collectionName, updatedById, startDateTime, endDateTime].filter(Boolean)
        .length,
    [collectionName, endDateTime, startDateTime, updatedById]
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
        collectionName,
        startDateTime,
        endDateTime,
      }),
    queryKey: [
      pageNumber,
      pageSize,
      updatedById,
      collectionName,
      startDateTime,
      endDateTime,
    ],
  })

  return (
    <>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Audit Logs</Typography>
      </Box>
      <Paper className='p-4 mb-4'>
        <Box className='flex items-center justify-between'>
          <Typography variant='h6'>{`Filters${
            appliedFiltersCount ? ` (${appliedFiltersCount} applied)` : ''
          }`}</Typography>
          <IconButton onClick={() => setFiltersExpanded(!filtersExpanded)}>
            {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={filtersExpanded} timeout='auto' unmountOnExit>
          <Grid
            container
            spacing={2}
            columns={{ xs: 1, sm: 2, md: 3 }}
            className='mt-2'>
            <Grid size={1}>
              <CollectionSelector />
            </Grid>
            <Grid size={1}></Grid>
            <Grid size={1}></Grid>
            <Grid size={1}>
              <UserSelector />
            </Grid>
            <Grid size={1}>
              <DateSelector
                label='Select Start Date & Time'
                searchKeyParam='startDateTime'
              />
            </Grid>
            <Grid size={1}>
              <DateSelector
                label='Select End Date & Time'
                searchKeyParam='endDateTime'
              />
            </Grid>
          </Grid>
        </Collapse>
      </Paper>
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
