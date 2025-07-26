'use client'

import { Button, DialogActions, DialogContent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

import { getAuditLogAction } from '@/actions/auditLogActions'
import ErrorAlert from '@/components/common/ErrorAlert'
import Modal from '@/components/common/Modal'
import handleServerAction from '@/lib/handleServerAction'

export default function ViewAuditLogUpdates() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const viewAuditLogId = useMemo(
    () => searchParams.get('viewAuditLog'),
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

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  return (
    <Modal
      open={Boolean(viewAuditLogId)}
      title='Updates'
      isLoading={isAuditLogLoading}
      onClose={handleClose}>
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
    </Modal>
  )
}
