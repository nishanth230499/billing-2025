'use server'

import { DEFAULT_PAGE_SIZE } from '@/constants/generalConstants'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { trackCreation, trackUpdates } from '@/lib/utils/auditLogUtils'
import { withAuth } from '@/lib/withAuth'
import withTransaction from '@/lib/withTransaction'
import { modelConstants } from '@/models/constants'
import Customer from '@/models/Customer'
import StockCycleCustomer, {
  additionalCustomerFields,
} from '@/models/StockCycleCustomer'

import {
  AUTO_GENERATE_CUSTOMER_ID,
  IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
  STOCK_CYCLE_CUSTOMER_FIELDS,
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
      ...(IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE && filter?.stockCycle
        ? filter?.stockCycle?.not
          ? [
              // Query all the customers who donot have data for given stockcycle, but populate it with some other stock cycle data
              {
                $lookup: {
                  from: modelConstants?.stock_cycle_customer?.collectionName,
                  let: { customerId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$customerId', '$$customerId'] },
                            { $eq: ['$stockCycleId', filter?.stockCycle?.id] },
                          ],
                        },
                      },
                    },
                    { $limit: 1 },
                  ],
                  as: 'stockCycleCustomer',
                },
              },
              {
                $match: {
                  stockCycleCustomer: { $size: 0 },
                },
              },
              {
                $lookup: {
                  from: modelConstants?.stock_cycle_customer?.collectionName,
                  let: { customerId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$customerId', '$$customerId'] },
                      },
                    },
                    { $limit: 1 },
                  ],
                  as: 'stockCycleCustomer',
                },
              },
              {
                $set: {
                  stockCycleCustomer: { $first: '$stockCycleCustomer' },
                },
              },
            ]
          : [
              // Query all the customers who does have the data for given stock cycle and populate the same
              {
                $lookup: {
                  from: modelConstants?.stock_cycle_customer?.collectionName,
                  let: { customerId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$customerId', '$$customerId'] },
                            { $eq: ['$stockCycleId', filter?.stockCycle?.id] },
                          ],
                        },
                      },
                    },
                    { $limit: 1 },
                  ],
                  as: 'stockCycleCustomer',
                },
              },
              {
                $match: {
                  $expr: { $gt: [{ $size: '$stockCycleCustomer' }, 0] },
                },
              },
              {
                $set: {
                  stockCycleCustomer: { $first: '$stockCycleCustomer' },
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

  let customer = await Customer.findById(customerId, {
    _id: 1,
    name: 1,
    place: 1,
    firmId: 1,
    openingBalance: 1,
  }).populate('firm', 'color')

  if (IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE) {
    await customer.populate({
      path: 'stockCycleCustomer',
      select: {
        billingName: 1,
        billingAddress: 1,
        gstin: 1,
        phoneNumber: 1,
        emailId: 1,
      },
      match: stockCycleId ? { stockCycleId: stockCycleId } : {},
    })
  }

  if (customer) {
    return { success: true, data: customer.toJSON() }
  }
  return { success: false, error: 'Customer not found!' }
}

async function createCustomer(customerReq) {
  await connectDB()

  try {
    const customerFields = {
      _id: AUTO_GENERATE_CUSTOMER_ID ? undefined : customerReq?._id,
      name: customerReq?.name,
      place: customerReq?.place,
      firmId: customerReq?.firmId,
      openingBalance: customerReq?.openingBalance,
    }

    const stockCycleFields = {
      stockCycleId: customerReq?.stockCycleId,
    }

    Object.keys(additionalCustomerFields).forEach((fieldName) => {
      if (STOCK_CYCLE_CUSTOMER_FIELDS.includes(fieldName)) {
        stockCycleFields[fieldName] = customerReq?.[fieldName]
      } else {
        customerFields[fieldName] = customerReq?.[fieldName]
      }
    })

    const { customerJson, stockCycleCustomerJSON } = await withTransaction(
      async ({ session }) => {
        const customer = new Customer(customerFields)
        await customer.save({ session })

        const customerJson = customer.toJSON()
        if (IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE) {
          stockCycleFields.customerId = customer._id
          const stockCycleCustomer = new StockCycleCustomer(stockCycleFields)
          await stockCycleCustomer.save({ session })

          const stockCycleCustomerJSON = stockCycleCustomer.toJSON()
          return { customerJson, stockCycleCustomerJSON }
        }
        return { customerJson }
      }
    )

    trackCreation({
      model: Customer,
      documentId: customerJson._id,
      newDocument: customerJson,
    })

    if (stockCycleCustomerJSON) {
      trackCreation({
        model: StockCycleCustomer,
        documentId: stockCycleCustomerJSON._id,
        newDocument: stockCycleCustomerJSON,
      })
    }

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

  if (!IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE) {
    return {
      success: false,
      error: 'The configuration does not allow to access this.',
    }
  }
  try {
    const stockCycleFields = {}
    Object.keys(additionalCustomerFields).forEach((fieldName) => {
      if (STOCK_CYCLE_CUSTOMER_FIELDS.includes(fieldName)) {
        stockCycleFields[fieldName] = customerReq?.[fieldName]
      }
    })
    stockCycleFields.stockCycleId = customerReq?.stockCycleId
    stockCycleFields.customerId = customerId

    const stockCycleCustomer = new StockCycleCustomer(stockCycleFields)
    await stockCycleCustomer.save()
    trackCreation({
      model: StockCycleCustomer,
      documentId: stockCycleCustomer._id,
      newDocument: stockCycleCustomer.toJSON(),
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
    const customerFields = {
      name: customerReq?.name,
      place: customerReq?.place,
      openingBalance: customerReq?.openingBalance,
    }

    const stockCycleFields = {}

    Object.keys(additionalCustomerFields).forEach((fieldName) => {
      if (STOCK_CYCLE_CUSTOMER_FIELDS.includes(fieldName)) {
        stockCycleFields[fieldName] = customerReq?.[fieldName]
      } else {
        customerFields[fieldName] = customerReq?.[fieldName]
      }
    })

    const {
      oldCustomerJSON,
      newCustomerJSON,
      oldStockCycleCustomerJSON,
      newStockCycleCustomerJSON,
    } = await withTransaction(async ({ session }) => {
      const customer = await Customer.findById(customerId)
        .session(session)
        .exec()

      const oldCustomerJSON = customer.toJSON()
      Object.assign(customer, customerFields)
      await customer.save({ session })
      const newCustomerJSON = customer.toJSON()

      if (IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE) {
        const stockCycleCustomer = await StockCycleCustomer.findOne({
          stockCycleId: customerReq?.stockCycleId,
          customerId: customerId,
        })
          .session(session)
          .exec()

        const oldStockCycleCustomerJSON = stockCycleCustomer.toJSON()
        Object.assign(stockCycleCustomer, stockCycleFields)
        await stockCycleCustomer.save({ session })
        const newStockCycleCustomerJSON = customer.toJSON()

        return {
          oldCustomerJSON,
          newCustomerJSON,
          oldStockCycleCustomerJSON,
          newStockCycleCustomerJSON,
        }
      }

      return { oldCustomerJSON, newCustomerJSON }
    })

    trackUpdates({
      model: Customer,
      documentId: oldCustomerJSON._id,
      oldDocument: oldCustomerJSON,
      newDocument: newCustomerJSON,
    })
    if (oldStockCycleCustomerJSON && newStockCycleCustomerJSON)
      trackUpdates({
        model: StockCycleCustomer,
        documentId: oldStockCycleCustomerJSON._id,
        oldDocument: oldStockCycleCustomerJSON,
        newDocument: newStockCycleCustomerJSON,
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
