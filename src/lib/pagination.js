import { DEFAULT_PAGE_SIZE } from '@/constants'

export async function getPaginatedData(model, options = {}) {
  const {
    filter = {},
    pageNumber = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    project = {},
    addFields = {},
  } = options

  const pipeline = [
    {
      $match: filter,
    },
  ]

  if (Object.keys(project).length > 0) {
    pipeline.push({ $project: project })
  }

  if (Object.keys(addFields).length > 0) {
    pipeline.push({ $addFields: addFields })
  }

  pipeline.push({
    $addFields: {
      _id: { $toString: '$_id' },
    },
  })

  pipeline.push({
    $facet: {
      paginatedResults: [
        { $skip: pageNumber * pageSize },
        { $limit: pageSize },
      ],
      totalCount: [{ $count: 'count' }],
    },
  })

  const result = await model.aggregate(pipeline)

  const paginatedResults = result[0]?.paginatedResults || []
  const totalCount = result[0]?.totalCount[0]?.count || 0

  return { paginatedResults, totalCount }
}
