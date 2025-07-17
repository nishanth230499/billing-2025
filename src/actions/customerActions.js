'use server'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { withAuth } from '@/lib/withAuth'
import { modelConstants } from '@/models/constants'
import Customer from '@/models/Customer'

async function getCustomers({
  pageNumber = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  searchText = '',
  sortFields = {},
  filter = {},
}) {
  await connectDB()
  const customers = await getPaginatedData(Customer, {
    pageNumber,
    pageSize,
    filtersPipeline: [
      ...(searchText
        ? [
            {
              $search: {
                index: 'id_name_place_search_index',
                compound: {
                  should: [
                    { autocomplete: { query: searchText, path: '_id' } },
                    {
                      autocomplete: {
                        query: searchText,
                        path: 'name',
                      },
                    },
                    { autocomplete: { query: searchText, path: 'place' } },
                  ],
                },
              },
            },
          ]
        : []),
      ...(filter?.stockCycle
        ? [
            {
              $lookup: {
                from: modelConstants.customer_details.collectionName,
                localField: '_id',
                foreignField: 'customerId',
                pipeline: [
                  { $match: { stockCycleId: filter?.stockCycle?.id } },
                ],
                as: 'customerDetails',
              },
            },
            {
              $match: {
                'customerDetails.0': { $exists: filter?.stockCycle?.exists },
              },
            },
          ]
        : []),
      ...(Object.keys(sortFields).length
        ? [
            {
              $sort: sortFields,
            },
          ]
        : []),
    ],
    paginatedResultsPipeline: [
      {
        $lookup: {
          from: modelConstants.firm.collectionName,
          localField: 'firmId',
          foreignField: '_id',
          as: 'firm',
        },
      },
    ],
  })

  return { success: true, data: customers }
}

export const getCustomersAction = withAuth(getCustomers)
