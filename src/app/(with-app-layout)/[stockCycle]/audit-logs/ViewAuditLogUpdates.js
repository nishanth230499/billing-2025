'use client'

import { Button, DialogActions, DialogContent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

import ErrorAlert from '@/components/common/ErrorAlert'
import { LOADING } from '@/constants'
import handleServerAction from '@/lib/handleServerAction'

import { getAuditLogAction } from '../../../../actions/auditLogActions'

export default function ViewAuditLogUpdates() {
  const router = useRouter()

  const searchParams = useSearchParams()

  const viewAuditLogId = useMemo(
    () => searchParams.get('view_audit_log_updates'),
    [searchParams]
  )

  const {
    data: auditLogResponse,
    isLoading: isAuditLogLoading,
    isError: isAuditLogError,
    error: auditLogError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getAuditLogAction, viewAuditLogId),
    queryKey: ['getAuditLogAction', viewAuditLogId],
    enabled: Boolean(viewAuditLogId),
  })

  return (
    <>
      {isAuditLogLoading ? LOADING : null}
      <DialogContent hidden={isAuditLogLoading}>
        <ErrorAlert isError={isAuditLogError} error={auditLogError}>
          <pre className='border p-4 rounded overflow-auto'>
            {JSON.stringify(auditLogResponse?.updatedFields, null, 2)}
          </pre>
        </ErrorAlert>
      </DialogContent>
      <DialogActions className='px-6 pb-4'>
        <Button onClick={router.back}>Close</Button>
      </DialogActions>
    </>
  )
}
