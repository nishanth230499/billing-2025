'use server'

import mongoose from 'mongoose'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { trackCreation } from '@/lib/utils/auditLogUtils'
import { withAuth } from '@/lib/withAuth'
import withTransaction from '@/lib/withTransaction'
import Item from '@/models/Item'

import {
  AUTO_GENERATE_COMPANY_ID,
  AUTO_GENERATE_ITEM_ID,
  AUTO_INCREMENT_ITEM_CODE,
  COMPANY_ID_ITEM_ID_DELIM,
  ITEM_CODE_DIGITS_COUNT,
} from '../../appConfig'

async function getItems({
  pageNumber = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  companyId = '',
  searchText = '',
  companySearchText = '',
  sortFields = {},
}) {
  await connectDB()
  const companies = await getPaginatedData(Item, {
    pageNumber,
    pageSize,
    filtersPipeline: [
      ...(companyId
        ? [
            {
              $match: {
                companyId: AUTO_GENERATE_COMPANY_ID
                  ? new mongoose.Types.ObjectId(companyId)
                  : companyId,
              },
            },
          ]
        : []),
      ...(searchText || companySearchText
        ? [
            {
              $search: {
                index: 'id_name_tags_company_searchIndex',
                compound: {
                  should: [
                    ...(searchText
                      ? [
                          { autocomplete: { query: searchText, path: '_id' } },
                          {
                            autocomplete: {
                              query: searchText,
                              path: 'name',
                            },
                          },
                          { autocomplete: { query: searchText, path: 'tags' } },
                        ]
                      : []),
                    ...(companySearchText
                      ? [
                          {
                            autocomplete: {
                              query: companySearchText,
                              path: 'company.name',
                            },
                          },
                          {
                            autocomplete: {
                              query: companySearchText,
                              path: 'company.shortName',
                            },
                          },
                          {
                            autocomplete: {
                              query: companySearchText,
                              path: 'company.tags',
                            },
                          },
                        ]
                      : []),
                  ],
                },
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
        $addFields: {
          companyId: { $toString: '$companyId' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          group: 1,
          price: 1,
          companyId: 1,
          'company.shortName': 1,
          hsnId: 1,
        },
      },
    ],
  })

  return { success: true, data: companies }
}

async function getItem(itemId) {
  await connectDB()
  const item = await Item.findById(
    AUTO_GENERATE_ITEM_ID ? new mongoose.Types.ObjectId(itemId) : itemId,
    {
      _id: 1,
      name: 1,
      group: 1,
      price: 1,
      tags: 1,
      'company.shortName': 1,
      hsnId: 1,
    }
  )

  if (item) {
    item._id = item._id.toString()
    item.companyId = item.companyId.toString()
    return { success: true, data: item }
  }
  return { success: false, error: 'Item not found!' }
}

async function createItem(itemReq) {
  await connectDB()

  try {
    const item = await withTransaction(async ({ session }) => {
      let _id = undefined
      if (!AUTO_GENERATE_ITEM_ID) {
        if (itemReq?.code) {
          if (COMPANY_ID_ITEM_ID_DELIM) {
            _id = `${itemReq?.companyId}${COMPANY_ID_ITEM_ID_DELIM}${itemReq?.code}`
          } else {
            _id = itemReq?.code
          }
        } else {
          if (!AUTO_INCREMENT_ITEM_CODE) {
            return { success: false, message: 'code is required.' }
          }

          const lastId =
            (
              await Item.aggregate([
                {
                  $addFields: {
                    code: COMPANY_ID_ITEM_ID_DELIM
                      ? {
                          $arrayElemAt: [
                            { $split: ['$_id', COMPANY_ID_ITEM_ID_DELIM] },
                            1,
                          ],
                        }
                      : '$_id',
                  },
                },
                {
                  $addFields: {
                    code: { $toInt: '$code' },
                  },
                },
                {
                  $group: {
                    _id: null,
                    maxCode: { $max: '$code' },
                  },
                },
              ]).session(session)
            )?.[0]?.maxCode ?? 0
          _id = COMPANY_ID_ITEM_ID_DELIM
            ? `${itemReq?.companyId}${COMPANY_ID_ITEM_ID_DELIM}${String(
                lastId + 1
              ).padStart(ITEM_CODE_DIGITS_COUNT, '0')}`
            : String(lastId + 1).padStart(ITEM_CODE_DIGITS_COUNT, '0')
        }
      }

      const item = new Item({
        _id,
        name: itemReq?.name,
        group: itemReq?.group,
        price: itemReq?.price,
        tags: itemReq?.tags,
        companyId: AUTO_GENERATE_ITEM_ID
          ? new mongoose.Types.ObjectId(itemReq?.companyId)
          : itemReq?.companyId,
        hsnId: itemReq?.hsnId,
      })

      await item.normalizer({}, session)
      await item.save({ session })
      return item
    })
    trackCreation({
      model: Item,
      documentId: item._id,
      newDocument: item.toObject(),
    })

    return {
      success: true,
      data: `Item created successfully with id: ${item._id.toString()}`,
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

//     const oldCompany = await Company.findOneAndUpdate(
//       {
//         _id: AUTO_GENERATE_COMPANY_ID
//           ? mongoose.Types.ObjectId(companyId)
//           : companyId,
//       },
//       companyUpdateFields,
//       {
//         runValidators: true,
//       }
//     ).lean()

//     trackUpdates({
//       model: Company,
//       documentId: oldCompany._id,
//       oldDocument: oldCompany,
//       newDocument: companyUpdateFields,
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

export const getItemsAction = withAuth(getItems)
export const getItemAction = withAuth(getItem)
export const createItemAction = withAuth(createItem)
// export const editCompanyAction = withAuth(editCompany)
