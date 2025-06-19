'use server'

import { Alert, Box } from '@mui/material'
import { notFound } from 'next/navigation'

import { getAcademicYearsAction } from '@/actions/academicYearActions'
import { getLoggedinUserAction } from '@/actions/authActions'
import getFirmsAction from '@/actions/firmActions'
import AppDrawer from '@/components/AppDrawer'

export default async function Layout({ children, params }) {
  const { academicYear: selectedAcademicYear } = await params
  const [
    { success: isUserSucces, data: loggedinUser, error: userError },
    {
      success: isAcademicYearsSuccess,
      data: academicYears,
      error: academicYearsError,
    },
    firms,
  ] = await Promise.all([
    getLoggedinUserAction(),
    getAcademicYearsAction(),
    getFirmsAction(),
  ])

  if (!isUserSucces) {
    // Redirect to login or change password, based on the userError string
    return <Alert severity='error'>{userError}</Alert>
  }
  if (!isAcademicYearsSuccess) {
    return <Alert severity='error'>{academicYearsError}</Alert>
  }
  if (!academicYears?.find(({ year }) => year === selectedAcademicYear))
    notFound()
  return (
    <Box className='flex'>
      <AppDrawer
        academicYears={academicYears}
        selectedAcademicYear={selectedAcademicYear}
        userName={loggedinUser?.name}
        userType={loggedinUser?.type}
        firms={firms}
      />
      <main className='min-w-0 w-full p-4'>{children}</main>
    </Box>
  )
}
