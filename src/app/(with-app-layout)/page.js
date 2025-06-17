'use server'

import { getDefaultAcademicYearAction } from '@/actions/academicYearActions'
import { redirect } from 'next/navigation'

export default async function Page() {
  const defaultAcademicYear = await getDefaultAcademicYearAction()
  if (defaultAcademicYear?.year) redirect(`/${defaultAcademicYear?.year}`)
  return null
}
