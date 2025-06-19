'use server'

import { Box } from '@mui/material'
import { notFound, redirect } from 'next/navigation'

import { getAcademicYearsAction } from '@/actions/academicYearActions'
import { getLoggedinUserAction } from '@/actions/authActions'
import getFirmsAction from '@/actions/firmActions'
import AppDrawer from '@/components/AppDrawer'
import NoAuthError from '@/lib/NoAuth'

export default async function Layout({ children, params }) {
  try {
    const { academicYear: selectedAcademicYear } = await params
    const [academicYears, user, firms] = await Promise.all([
      getAcademicYearsAction(),
      getLoggedinUserAction(),
      getFirmsAction(),
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
          firms={firms}
        />
        <main className='min-w-0 w-full p-4'>{children}</main>
      </Box>
    )
  } catch (e) {
    if (e instanceof NoAuthError) redirect('/login')
    else throw e
  }
}
