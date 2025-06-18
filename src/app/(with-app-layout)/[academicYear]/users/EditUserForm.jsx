'use server'

import { getUserAction } from '@/actions/userActions'
import CreateOrEditUserForm from './CreateOrEditUserForm'
import { Alert } from '@mui/material'

export default async function EditUserForm({ editingUserId }) {
  if (editingUserId) {
    const user = await getUserAction(editingUserId)
    return <CreateOrEditUserForm editingUser={user} />
  }
  return <Alert severity='error'>No user selected for editing!</Alert>
}
