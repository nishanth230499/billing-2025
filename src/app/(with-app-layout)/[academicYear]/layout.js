'use server'

import { Box } from '@mui/material'
import { notFound } from 'next/navigation'

import { getAcademicYearsAction } from '@/actions/academicYearActions'
import { getLoggedinUserAction } from '@/actions/authActions'
import AppDrawer from '@/components/AppDrawer'

export default async function Layout({ children, params }) {
  const { academicYear: selectedAcademicYear } = await params

  const [academicYears, user] = await Promise.all([
    getAcademicYearsAction(),
    getLoggedinUserAction(),
  ])
  if (!academicYears?.find(({ year }) => year === selectedAcademicYear))
    notFound()

  return (
    <Box className='flex'>
      <AppDrawer
        academicYears={academicYears}
        selectedAcademicYear={selectedAcademicYear}
        userName={user?.name}
        userType={user?.type}
      />
      <main className='min-w-0 w-full p-4'>{children}</main>
    </Box>
  )
}
