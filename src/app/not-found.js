import { getDefaultAcademicYearAction } from '@/actions/academicYearActions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function NotFound() {
  if ((await headers()).get('x-loggedin-user')) {
    const defaultAcademicYear = await getDefaultAcademicYearAction()
    if (defaultAcademicYear?.year) redirect(`/${defaultAcademicYear?.year}`)
  } else {
    redirect('/login')
  }
  return '404'
}
