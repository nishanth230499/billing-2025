'use server'

import { redirect } from 'next/navigation'

import { getDefaultAcademicYearAction } from '@/actions/academicYearActions'

export default async function Page() {
  const defaultAcademicYear = await getDefaultAcademicYearAction()
  if (defaultAcademicYear?.year) redirect(`/${defaultAcademicYear?.year}`)
  return null
}
