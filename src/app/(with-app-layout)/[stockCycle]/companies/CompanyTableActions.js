'use client'

import EditIcon from '@mui/icons-material/Edit'
import { IconButton, Tooltip } from '@mui/material'
import Link from 'next/link'

import useModalControl from '@/hooks/useModalControl'

export default function CompanyTableActions({ data }) {
  const { getModalURL: getEditCompanyModalURL } = useModalControl('editCompany')
  return (
    <Tooltip title='Edit Company'>
      <IconButton
        color='primary'
        LinkComponent={Link}
        href={getEditCompanyModalURL(data?._id)}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  )
}
