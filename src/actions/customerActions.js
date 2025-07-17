'use server'

import mongoose from 'mongoose'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import { trackCreation } from '@/lib/auditLogUtils'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { withAuth } from '@/lib/withAuth'
import { modelConstants } from '@/models/constants'
import Customer from '@/models/Customer'
import CustomerDetails from '@/models/CustomerDetails'

import { CUSTOMER_DETAILS_SPECIFIC_TO } from '../../appConfig'

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
                  {
                    $addFields: {
                      _id: { $toString: '$_id' },
                    },
                  },
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

async function getCustomer(customerId) {
  await connectDB()

  const customer = await Customer.findOne({
    _id: CUSTOMER_DETAILS_SPECIFIC_TO.includes(
      modelConstants.stock_cycle.collectionName
    )
      ? customerId
      : new mongoose.Types.ObjectId(customerId),
  }).lean()
  if (customer) {
    customer._id = customer._id.toString()
    return { success: true, data: customer }
  }
  return { success: false, error: 'User not found!' }
}

async function addCustomer(customerReq) {
  await connectDB()

  try {
    const customerDetails = new CustomerDetails(customerReq)
    await customerDetails.save()

    trackCreation({
      model: CustomerDetails,
      documentId: customerDetails._id,
      newDocument: customerDetails.toObject(),
    })
    return {
      success: true,
      data: 'Customer added successfully!',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
}

export const getCustomersAction = withAuth(getCustomers)
export const getCustomerAction = withAuth(getCustomer)
export const addCustomerAction = withAuth(addCustomer)
