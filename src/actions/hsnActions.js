'use server'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { withAuth } from '@/lib/withAuth'
import Hsn from '@/models/Hsn'

async function getHsns({
  pageNumber = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  searchText = '',
}) {
  await connectDB()

  const hsns = await getPaginatedData(Hsn, {
    filtersPipeline: searchText
      ? [
          {
            $match: {
              _id: { $regex: searchText, $options: 'i' },
            },
          },
        ]
      : [],
    pageNumber,
    pageSize,
    paginatedResultsPipeline: [{ $project: { _id: 1 } }],
  })

  return { success: true, data: hsns }
}

async function getHsn(hsnId) {
  await connectDB()

  const hsn = await Hsn.findById(hsnId)
  if (hsn) {
    return { success: true, data: hsn.toJSON() }
  }
  return { success: false, error: 'HSN not found!' }
}

export const getHsnsAction = withAuth(getHsns)
export const getHsnAction = withAuth(getHsn)
