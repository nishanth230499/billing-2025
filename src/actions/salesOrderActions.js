'use server'

import connectDB from '@/lib/connectDB'
import { getIncrementedNumber } from '@/lib/getIncrementedNumber'
import { trackCreation } from '@/lib/utils/auditLogUtils'
import { withAuth } from '@/lib/withAuth'
import withTransaction from '@/lib/withTransaction'
import SalesOrder from '@/models/SalesOrder'

// async function getCompanies({
//   pageNumber = 0,
//   pageSize = DEFAULT_PAGE_SIZE,
//   searchText = '',
//   sortFields = {},
// }) {
//   await connectDB()
//   const companies = await getPaginatedData(Company, {
//     pageNumber,
//     pageSize,
//     filtersPipeline: [
//       ...(searchText
//         ? [
//             {
//               $search: {
//                 index: 'id_name_shortName_tags_searchIndex',
//                 compound: {
//                   should: [
//                     { autocomplete: { query: searchText, path: '_id' } },
//                     {
//                       autocomplete: {
//                         query: searchText,
//                         path: 'name',
//                       },
//                     },
//                     {
//                       autocomplete: {
//                         query: searchText,
//                         path: 'shortName',
//                       },
//                     },
//                     { autocomplete: { query: searchText, path: 'tags' } },
//                   ],
//                 },
//               },
//             },
//           ]
//         : []),
//       ...(Object.keys(sortFields).length
//         ? [
//             {
//               $sort: sortFields,
//             },
//           ]
//         : []),
//     ],
//     paginatedResultsPipeline: [
//       {
//         $lookup: {
//           from: modelConstants.firm.collectionName,
//           localField: 'firmId',
//           foreignField: '_id',
//           as: 'firm',
//         },
//       },
//       {
//         $set: {
//           firm: { $first: '$firm' },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//           'firm.color': 1,
//         },
//       },
//     ],
//   })

//   return { success: true, data: companies }
// }

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

// export const getCompaniesAction = withAuth(getCompanies)
// export const getCompanyAction = withAuth(getCompany)
export const createSalesOrderAction = withAuth(createSalesOrder)
// export const editCompanyAction = withAuth(editCompany)
