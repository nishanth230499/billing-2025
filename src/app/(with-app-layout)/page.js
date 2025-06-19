'use server'

import { Alert } from '@mui/material'
import { redirect } from 'next/navigation'

import { getDefaultAcademicYearAction } from '@/actions/academicYearActions'

export default async function Page() {
  const {
    success,
    error: defaultAcademicYearError,
    data: defaultAcademicYear,
  } = await getDefaultAcademicYearAction()
  if (!success) {
    return <Alert severity='error'>{defaultAcademicYearError}</Alert>
  }
  if (defaultAcademicYear?.year) redirect(`/${defaultAcademicYear?.year}`)
  return null
}
