'use server'

import mongoose from 'mongoose'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import { trackCreation } from '@/lib/auditLogUtils'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { withAuth } from '@/lib/withAuth'
import withTransaction from '@/lib/withTransaction'
import { modelConstants } from '@/models/constants'
import Customer from '@/models/Customer'
import CustomerDetails from '@/models/CustomerDetails'

import {
  AUTO_GENERATE_CUSTOMER_ID,
  CUSTOMER_DETAILS_SPECIFIC_TO,
} from '../../appConfig'

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
  })
    .populate({
      path: 'customerDetails',
      options: { sort: { _id: -1 }, limit: 1 },
    })
    .lean()
  if (customer) {
    customer._id = customer._id.toString()
    return { success: true, data: customer }
  }
  return { success: false, error: 'User not found!' }
}

async function createCustomer(customerReq) {
  await connectDB()

  try {
    const { customer, customerDetails } = await withTransaction(
      async ({ session }) => {
        const customer = new Customer({
          _id: AUTO_GENERATE_CUSTOMER_ID ? undefined : customerReq?._id,
          name: customerReq?.name,
          place: customerReq?.place,
          firmId: customerReq?.firmId,
          openingBalance: customerReq?.openingBalance,
        })

        const customerDetails = new CustomerDetails({
          customerId: customer._id,
          stockCycleId: CUSTOMER_DETAILS_SPECIFIC_TO.includes(
            modelConstants.stock_cycle.collectionName
          )
            ? customerReq?.stockCycleId
            : undefined,
          billingName: customerReq?.billingName,
          billingAddress: customerReq?.billingAddress,
          emailId: customerReq?.emailId,
          phoneNumber: customerReq?.phoneNumber,
        })

        await customer.save({ session })
        await customerDetails.save({ session })

        return { customer, customerDetails }
      }
    )

    trackCreation({
      model: Customer,
      documentId: customer._id,
      newDocument: customer.toObject(),
    })
    trackCreation({
      model: CustomerDetails,
      documentId: customerDetails._id,
      newDocument: customerDetails.toObject(),
    })
    return {
      success: true,
      data: 'Customer created successfully!',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
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
export const createCustomerAction = withAuth(createCustomer)
export const addCustomerAction = withAuth(addCustomer)
