'use client'

import VisibilityIcon from '@mui/icons-material/Visibility'
import { IconButton, Tooltip } from '@mui/material'

import useModalControl from '@/hooks/useModalControl'

export default function AuditLogTableActions({ data }) {
  const { setModalValue: setViewAuditLogModalValue } =
    useModalControl('viewAuditLog')
  return (
    <Tooltip title='View Audit Log'>
      <IconButton
        color='primary'
        onClick={() => setViewAuditLogModalValue(data?._id)}>
        <VisibilityIcon />
      </IconButton>
    </Tooltip>
  )
}
