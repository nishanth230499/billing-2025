'use server'

import mongoose from 'mongoose'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { trackCreation, trackUpdates } from '@/lib/utils/auditLogUtils'
import { withAuth } from '@/lib/withAuth'
import withTransaction from '@/lib/withTransaction'
import { modelConstants } from '@/models/constants'
import Customer, { additionalCustomerFields } from '@/models/Customer'

import {
  AUTO_GENERATE_CUSTOMER_ID,
  IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
  STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS,
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
                index: 'id_name_place_searchIndex',
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
            filter?.stockCycle?.not
              ? {
                  $match: {
                    stockCycleOverrides: {
                      $not: {
                        $elemMatch: {
                          _id: filter?.stockCycle?.id,
                        },
                      },
                    },
                  },
                }
              : {
                  $match: {
                    'stockCycleOverrides._id': filter?.stockCycle?.id,
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
      {
        $set: {
          firm: { $first: '$firm' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          place: 1,
          'firm.color': 1,
        },
      },
    ],
  })

  return { success: true, data: customers }
}

async function getCustomer(customerId, stockCycleId = '') {
  await connectDB()
  const customer = await Customer.aggregate([
    {
      $match: { _id: customerId },
    },
    {
      $lookup: {
        from: modelConstants.firm.collectionName,
        localField: 'firmId',
        foreignField: '_id',
        as: 'firm',
      },
    },
    {
      $set: {
        firm: { $first: '$firm' },
      },
    },
    ...(IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE
      ? [
          ...(stockCycleId
            ? [
                {
                  $set: {
                    stockCycleOverrides: {
                      $filter: {
                        input: '$stockCycleOverrides',
                        as: 'stockCycleOverrides',
                        cond: {
                          $eq: ['$$stockCycleOverrides._id', stockCycleId],
                        },
                      },
                    },
                  },
                },
              ]
            : []),
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: ['$$ROOT', { $last: '$stockCycleOverrides' }],
              },
            },
          },
          {
            $project: {
              stockCycleOverrides: 0,
            },
          },
        ]
      : []),
  ])

  if (customer[0]) {
    customer[0]._id = customer[0]._id.toString()
    return { success: true, data: customer[0] }
  }
  return { success: false, error: 'Customer not found!' }
}

async function createCustomer(customerReq) {
  await connectDB()

  try {
    const customer = new Customer({
      _id: AUTO_GENERATE_CUSTOMER_ID ? undefined : customerReq?._id,
      name: customerReq?.name,
      place: customerReq?.place,
      firmId: customerReq?.firmId,
      openingBalance: customerReq?.openingBalance,
    })

    const stockCycleFields = {}

    Object.keys(additionalCustomerFields).forEach((fieldName) => {
      if (STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.includes(fieldName)) {
        stockCycleFields[fieldName] = customerReq?.[fieldName]
      } else {
        customer[fieldName] = customerReq?.[fieldName]
      }
    })

    if (IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE) {
      stockCycleFields._id = customerReq?.stockCycleId
      customer.stockCycleOverrides = [stockCycleFields]
    }

    await customer.save()

    trackCreation({
      model: Customer,
      documentId: customer._id,
      newDocument: customer.toObject(),
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

async function addCustomer(customerId, customerReq) {
  await connectDB()
  try {
    const stockCycleFields = {}
    Object.keys(additionalCustomerFields).forEach((fieldName) => {
      if (STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.includes(fieldName)) {
        stockCycleFields[fieldName] = customerReq?.[fieldName]
      }
    })
    stockCycleFields._id = customerReq?.stockCycleId

    const { oldCustomer, newCustomer } = await withTransaction(
      async ({ session }) => {
        const customer = await Customer.findById(customerId)
          .session(session)
          .exec()
        const oldCustomer = customer.toObject()
        customer.stockCycleOverrides.push(stockCycleFields)
        await customer.save({ session })
        const newCustomer = customer.toObject()
        return { oldCustomer, newCustomer }
      }
    )

    trackUpdates({
      model: Customer,
      documentId: oldCustomer._id,
      oldDocument: oldCustomer,
      newDocument: newCustomer,
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

async function editCustomer(customerId, customerReq) {
  await connectDB()

  try {
    const { oldCustomer, newCustomer } = await withTransaction(
      async ({ session }) => {
        const customer = await Customer.findById(
          AUTO_GENERATE_CUSTOMER_ID
            ? mongoose.Types.ObjectId(customerId)
            : customerId
        )
          .session(session)
          .exec()
        const oldCustomer = customer.toObject()

        customer.name = customerReq?.name
        customer.place = customerReq?.place
        customer.openingBalance = customerReq?.openingBalance

        if (IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE) {
          const overrides = customer.stockCycleOverrides.id(
            customerReq?.stockCycleId
          )

          Object.keys(additionalCustomerFields).forEach((fieldName) => {
            if (STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.includes(fieldName)) {
              overrides[fieldName] = customerReq?.[fieldName]
            } else {
              customer[fieldName] = customerReq?.[fieldName]
            }
          })
        } else {
          Object.keys(additionalCustomerFields).forEach((fieldName) => {
            if (!STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.includes(fieldName)) {
              customer[fieldName] = customerReq?.[fieldName]
            }
          })
        }

        await customer.save({ session })
        const newCustomer = customer.toObject()
        return { oldCustomer, newCustomer }
      }
    )

    trackUpdates({
      model: Customer,
      documentId: oldCustomer._id,
      oldDocument: oldCustomer,
      newDocument: newCustomer,
    })

    return {
      success: true,
      data: 'Customer saved successfully!',
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
export const editCustomerAction = withAuth(editCustomer)
