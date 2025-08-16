'use server'

import mongoose from 'mongoose'

import { DEFAULT_PAGE_SIZE } from '@/constants/generalConstants'
import connectDB from '@/lib/connectDB'
import DocumentParser from '@/lib/DocumentParser'
import { getIncrementedNumber } from '@/lib/getIncrementedNumber'
import { getPaginatedData } from '@/lib/pagination'
import { trackCreation, trackUpdates } from '@/lib/utils/auditLogUtils'
import { withAuth } from '@/lib/withAuth'
import withTransaction from '@/lib/withTransaction'
import { modelConstants } from '@/models/constants'
import Customer from '@/models/Customer'
import Item from '@/models/Item'
import ParsedSalesOrderSchema from '@/models/ParsedSalesOrderSchema'
import SalesOrder from '@/models/SalesOrder'

import {
  AUTO_GENERATE_CUSTOMER_ID,
  IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
} from '../../appConfig'

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

async function getSalesOrder(stockCycleId, number) {
  await connectDB()
  const salesOrder = await SalesOrder.findOne(
    {
      stockCycleId,
      number,
    },
    {
      number: 1,
      customerId: 1,
      customerShippingAddressId: 1,
      date: 1,
      orderRef: 1,
      supplyDate: 1,
      isSetPack: 1,
      'items.itemId': 1,
      'items.group': 1,
      'items.quantity': 1,
      'items.unitQuantity': 1,
    }
  )
    .populate({
      path: 'customer',
      select: 'name place firmId',
      populate: [
        {
          path: 'stockCycleCustomer',
          select: 'billingName billingAddress phoneNumber emailId gstin',
        },
        {
          path: 'firm',
          select: 'name gstin address phoneNumber emailId',
        },
      ],
    })
    .populate('customerShippingAddress', 'name address')
    .populate('items.item', { name: 1, 'company.shortName': 1 })
    .exec()

  if (salesOrder) {
    return { success: true, data: salesOrder.toJSON() }
  }
  return { success: false, error: 'Sales Order not found!' }
}

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
      data: {
        message: 'Sales Order created successfully!',
        orderNumber: salesOrder?.number,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
}

async function editSalesOrder(stockCycleId, number, salesOrderReq) {
  await connectDB()

  try {
    const salesOrderFields = {
      customerId: salesOrderReq?.customerId,
      customerShippingAddressId: salesOrderReq?.customerShippingAddressId,
      supplyDate: salesOrderReq?.supplyDate,
      orderRef: salesOrderReq?.orderRef,
      isSetPack: salesOrderReq?.isSetPack,
      items: salesOrderReq?.items,
    }

    const salesOrder = await SalesOrder.findOneAndUpdate(
      { stockCycleId, number },
      salesOrderFields,
      { runValidators: true }
    )

    trackUpdates({
      model: SalesOrder,
      documentId: salesOrder._id,
      oldDocument: salesOrder.toJSON(),
      newDocument: salesOrderFields,
    })

    return {
      success: true,
      data: {
        message: 'Sales Order saved successfully!',
        orderNumber: salesOrder?.number,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
}

async function parseSalesOrder(stockCycleId, documentsFormData) {
  await connectDB()

  try {
    const documents = documentsFormData.getAll('document')
    const documentParser = new DocumentParser()
    await documentParser.addDocuments(documents)
    const parsedSalesOrder = await documentParser.parse(ParsedSalesOrderSchema)

    const [items, customerId] = await Promise.all([
      Promise.all(
        parsedSalesOrder?.items?.map(
          async (orderItem) =>
            await Promise.all(
              orderItem?.variants?.map(async ({ variant_name, qty }) => {
                return (
                  await Item.aggregate([
                    {
                      $search: {
                        index: 'id_name_tags_company_searchIndex',
                        text: {
                          query: `${orderItem?.category} ${orderItem?.name} ${variant_name}`,
                          path: [
                            'name',
                            'tags',
                            'company.name',
                            'company.shortName',
                            'company.tags',
                          ],
                          fuzzy: { maxEdits: 2 },
                        },
                      },
                    },
                    { $limit: 1 },
                    {
                      $addFields: {
                        quantity: qty,
                        unitQuantity: 1,
                      },
                    },
                    {
                      $project: {
                        _id: { $toString: '$_id' },
                        name: 1,
                        group: 1,
                        'company.shortName': 1,
                        quantity: 1,
                        unitQuantity: 1,
                      },
                    },
                  ])
                )[0]
              })
            )
        )
      ),
      (async () => {
        const customer = await Customer.aggregate([
          {
            $search: {
              index: 'id_name_place_searchIndex',
              text: {
                query: `${parsedSalesOrder?.customerName} ${parsedSalesOrder?.customerPlace}`,
                path: ['name', 'place'],
                fuzzy: { maxEdits: 2 },
              },
            },
          },
          ...(IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE
            ? [
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
                              { $eq: ['$stockCycleId', stockCycleId] },
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
              ]
            : []),
          { $limit: 1 },
          {
            $project: {
              _id: { $toString: '$_id' },
            },
          },
        ])

        // TODO: Also parse customer shipping address ID
        return customer[0]?._id?.toString()
      })(),
    ])
    return {
      success: true,
      data: {
        message: 'Parsed Successfully!',
        parsedSalesOrder: {
          customerId,
          orderRef: parsedSalesOrder?.orderRef,
          items: items.flat(),
        },
      },
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
}

export const getSalesOrdersAction = withAuth(getSalesOrders)
export const getSalesOrderAction = withAuth(getSalesOrder)
export const createSalesOrderAction = withAuth(createSalesOrder)
export const editSalesOrderAction = withAuth(editSalesOrder)
export const parseSalesOrderAction = withAuth(parseSalesOrder)
