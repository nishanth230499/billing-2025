'use client'

import { Alert, Button, DialogActions, DialogContent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

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

  if (isAuditLogError) {
    return <Alert severity='error'>{auditLogError?.message}</Alert>
  }

  return (
    <>
      {isAuditLogLoading ? LOADING : null}
      <DialogContent hidden={isAuditLogLoading}>
        <pre className='border p-4 rounded overflow-auto'>
          {JSON.stringify(auditLogResponse?.updatedFields, null, 2)}
        </pre>
      </DialogContent>
      <DialogActions className='px-6 pb-5'>
        <Button onClick={router.back}>Close</Button>
      </DialogActions>
    </>
  )
}
