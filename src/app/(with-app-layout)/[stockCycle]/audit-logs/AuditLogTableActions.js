'use client'

import VisibilityIcon from '@mui/icons-material/Visibility'
import { IconButton, Tooltip } from '@mui/material'
import Link from 'next/link'

import useModalControl from '@/hooks/useModalControl'

export default function AuditLogTableActions({ data }) {
  const { getModalURL: getViewAuditLogModalURL } =
    useModalControl('viewAuditLog')
  return (
    <Tooltip title='View Audit Log'>
      <IconButton
        color='primary'
        LinkComponent={Link}
        href={getViewAuditLogModalURL(data?._id)}>
        <VisibilityIcon />
      </IconButton>
    </Tooltip>
  )
}
