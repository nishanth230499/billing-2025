'use server'

import connectDB from '@/lib/connectDB'
import { withAuth } from '@/lib/withAuth'
import AcademicYear from '@/models/AcademicYear'

async function getAcademicYears() {
  await connectDB()
  console.log(' * Page Reloaded')
  const academicYears = await AcademicYear.find({}, { _id: 0 })
    .sort({
      year: 1,
    })
    .lean()

  return { success: true, data: academicYears }
}

async function getDefaultAcademicYear() {
  await connectDB()

  const defaultAcademicYear = await AcademicYear.find(
    { default: true },
    { _id: 0 }
  )
    .sort({ year: -1 })
    .limit(1)
    .lean()

  return { success: true, data: defaultAcademicYear[0] }
}

export const getAcademicYearsAction = withAuth(getAcademicYears)
export const getDefaultAcademicYearAction = withAuth(getDefaultAcademicYear)
