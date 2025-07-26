'use client'

import VisibilityIcon from '@mui/icons-material/Visibility'
import { IconButton } from '@mui/material'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'

export default function AuditLogTableActions({ data }) {
  const { getURL } = useHandleSearchParams()
  return (
    <IconButton
      color='primary'
      onClick={() =>
        window.history.pushState({}, '', getURL({ viewAuditLog: data?._id }))
      }>
      <VisibilityIcon />
    </IconButton>
  )
}
