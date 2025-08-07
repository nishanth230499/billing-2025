'use server'

import mongoose from 'mongoose'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import connectDB from '@/lib/connectDB'
import { getIncrementedNumber } from '@/lib/getIncrementedNumber'
import { getPaginatedData } from '@/lib/pagination'
import { trackCreation } from '@/lib/utils/auditLogUtils'
import { withAuth } from '@/lib/withAuth'
import withTransaction from '@/lib/withTransaction'
import { modelConstants } from '@/models/constants'
import SalesOrder from '@/models/SalesOrder'

import { AUTO_GENERATE_CUSTOMER_ID } from '../../appConfig'

async function getSalesOrders({
  pageNumber = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  stockCycleId,
  customerId,
}) {
  await connectDB()

  const salesOrders = await getPaginatedData(SalesOrder, {
    pageNumber,
    pageSize,
    filtersPipeline: [
      {
        $match: {
          stockCycleId,
          ...(customerId
            ? {
                customerId: AUTO_GENERATE_CUSTOMER_ID
                  ? new mongoose.Types.ObjectId(customerId)
                  : customerId,
              }
            : {}),
        },
      },
      { $sort: { number: 1 } },
    ],
    paginatedResultsPipeline: [
      {
        $lookup: {
          from: modelConstants.customer.collectionName,
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      {
        $lookup: {
          from: modelConstants.customer_shipping_address.collectionName,
          localField: 'customerShippingAddressId',
          foreignField: '_id',
          as: 'customerShippingAddress',
        },
      },
      {
        $set: {
          customer: { $first: '$customer' },
          customerShippingAddress: { $first: '$customerShippingAddress' },
        },
      },
      {
        $project: {
          _id: 1,
          number: 1,
          orderRef: 1,
          date: 1,
          supplyDate: 1,
          'customer.name': 1,
          'customerShippingAddress.name': 1,
        },
      },
    ],
  })

  return { success: true, data: salesOrders }
}

// async function getCompany(companyId) {
//   await connectDB()
//   const company = await Company.findById(companyId).populate('firm')

//   if (company) {
//     return { success: true, data: company.toJSON() }
//   }
//   return { success: false, error: 'Company not found!' }
// }

async function createSalesOrder(stockCycleId, salesOrderReq) {
  await connectDB()

  try {
    const salesOrder = await withTransaction(async ({ session }) => {
      const number = await getIncrementedNumber(
        { model: SalesOrder, filters: { stockCycleId } },
        session
      )
      const salesOrder = new SalesOrder({
        stockCycleId,
        number,
        customerId: salesOrderReq?.customerId,
        customerShippingAddressId: salesOrderReq?.customerShippingAddressId,
        date: salesOrderReq?.date,
        supplyDate: salesOrderReq?.supplyDate,
        orderRef: salesOrderReq?.orderRef,
        isSetPack: salesOrderReq?.isSetPack,
        items: salesOrderReq?.items,
      })

      await salesOrder.save()
      return salesOrder
    })

    trackCreation({
      model: SalesOrder,
      documentId: salesOrder._id,
      newDocument: salesOrder.toJSON(),
    })

    return {
      success: true,
      data: 'Sales Order created successfully!',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
}

// async function editCompany(companyId, companyReq) {
//   await connectDB()

//   try {
//     const companyUpdateFields = {
//       name: companyReq?.name,
//       shortName: companyReq?.shortName,
//       address: companyReq?.address,
//       gstin: companyReq?.gstin,
//       phoneNumber: companyReq?.phoneNumber,
//       emailId: companyReq?.emailId,
//       shippingAddress: companyReq?.shippingAddress,
//       shippingPhoneNumber: companyReq?.shippingPhoneNumber,
//       tags: companyReq?.tags,
//     }

//     const { oldCompanyJSON, newCompanyJSON } = await withTransaction(
//       async ({ session }) => {
//         const company = await Company.findById(companyId)
//           .session(session)
//           .exec()
//         const oldCompany = company.toObject()
//         const oldCompanyJSON = company.toJSON()

//         Object.assign(company, companyUpdateFields)
//         await company.normalizer(oldCompany, session)
//         await company.save({ session })

//         const newCompanyJSON = company.toJSON()

//         return { oldCompanyJSON, newCompanyJSON }
//       }
//     )
//     trackUpdates({
//       model: Company,
//       documentId: oldCompanyJSON._id,
//       oldDocument: oldCompanyJSON,
//       newDocument: newCompanyJSON,
//     })

//     return {
//       success: true,
//       data: 'Company saved successfully!',
//     }
//   } catch (e) {
//     console.error(e)
//     return {
//       success: false,
//       error: e.message,
//     }
//   }
// }

export const getSalesOrdersAction = withAuth(getSalesOrders)
// export const getCompanyAction = withAuth(getCompany)
export const createSalesOrderAction = withAuth(createSalesOrder)
// export const editCompanyAction = withAuth(editCompany)
