'use server'

import { redirect } from 'next/navigation'

import { getDefaultAcademicYearAction } from '@/actions/academicYearActions'
import NoAuthError from '@/lib/NoAuth'

export default async function Page() {
  try {
    const defaultAcademicYear = await getDefaultAcademicYearAction()
    if (defaultAcademicYear?.year) redirect(`/${defaultAcademicYear?.year}`)
    return null
  } catch (e) {
    if (e instanceof NoAuthError) redirect('/login')
    else throw e
  }
}
