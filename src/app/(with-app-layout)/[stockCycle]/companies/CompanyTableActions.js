'use client'

import EditIcon from '@mui/icons-material/Edit'
import { IconButton, Tooltip } from '@mui/material'

import useModalControl from '@/hooks/useModalControl'

export default function CompanyTableActions({ data }) {
  const { setModalValue: setEditCompanyModalValue } =
    useModalControl('editCompany')
  return (
    <Tooltip title='Edit Company'>
      <IconButton
        color='primary'
        onClick={() => setEditCompanyModalValue(data?._id)}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  )
}
