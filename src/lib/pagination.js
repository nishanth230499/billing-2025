'use server'

import { DEFAULT_PAGE_SIZE } from '@/constants'

export async function getPaginatedData(model, options = {}) {
  const {
    filtersPipeline = [],
    pageNumber = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    paginatedResultsPipeline = [],
  } = options

  const pipeline = [
    ...filtersPipeline,
    {
      $facet: {
        paginatedResults: [
          { $skip: pageNumber * pageSize },
          { $limit: pageSize },
          ...paginatedResultsPipeline,
          {
            $addFields: {
              _id: { $toString: '$_id' },
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]

  const result = await model.aggregate(pipeline)

  const paginatedResults = result[0]?.paginatedResults || []
  const totalCount = result[0]?.totalCount[0]?.count || 0

  return { paginatedResults, totalCount }
}
