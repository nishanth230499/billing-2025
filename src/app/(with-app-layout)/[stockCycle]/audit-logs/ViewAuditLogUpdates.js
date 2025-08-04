'use client'

import { Button, DialogActions, DialogContent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import { getAuditLogAction } from '@/actions/auditLogActions'
import ErrorAlert from '@/components/common/ErrorAlert'
import Modal from '@/components/common/Modal'
import useModalControl from '@/hooks/useModalControl'
import handleServerAction from '@/lib/handleServerAction'

export default function ViewAuditLogUpdates() {
  const { modalValue: viewAuditLogId, handleCloseModal } =
    useModalControl('viewAuditLog')

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
    <Modal
      open={Boolean(viewAuditLogId)}
      title='Updates'
      isLoading={isAuditLogLoading}
      onClose={handleCloseModal}>
      <DialogContent hidden={isAuditLogLoading}>
        <ErrorAlert isError={isAuditLogError} error={auditLogError}>
          <pre className='border p-4 rounded overflow-auto'>
            {JSON.stringify(auditLogResponse?.updatedFields, null, 2)}
          </pre>
        </ErrorAlert>
      </DialogContent>
      <DialogActions className='px-6 pb-4'>
        <Button onClick={handleCloseModal}>Close</Button>
      </DialogActions>
    </Modal>
  )
}
