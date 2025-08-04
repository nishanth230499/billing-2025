'use client'

import EditIcon from '@mui/icons-material/Edit'
import { IconButton, Tooltip } from '@mui/material'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'

export default function CompanyTableActions({ data }) {
  const { getURL } = useHandleSearchParams()
  return (
    <Tooltip title='Edit Company'>
      <IconButton
        color='primary'
        onClick={() =>
          window.history.pushState({}, '', getURL({ editCompany: data?._id }))
        }>
        <EditIcon />
      </IconButton>
    </Tooltip>
  )
}
