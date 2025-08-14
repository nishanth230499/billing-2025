'use server'

import mongoose from 'mongoose'

import connectDB from '@/lib/connectDB'
import { withAuth } from '@/lib/withAuth'
import { modelConstants } from '@/models/constants'
import SalesOrder from '@/models/SalesOrder'

import { AUTO_GENERATE_CUSTOMER_ID } from '../../appConfig'

async function getPackingNote({ stockCycleId, customerId }) {
  await connectDB()

  let packingNote = await SalesOrder.aggregate([
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
    { $unwind: '$items' },
    {
      $set: {
        orderedQuantity: '$items.quantity',
      },
    },
    // TODO: Populate packedListQuantity and invoicedQuantity
    {
      $group: {
        _id: {
          customerId: '$customerId',
          customerShippingAddressId: '$customerShippingAddressId',
          isSetPack: '$isSetPack',
          orderRef: '$orderRef',
          itemId: '$items.itemId',
        },
        orderedQuantity: {
          $sum: { $ifNull: ['$orderedQuantity', 0] },
        },
        packedListQuantityForShipping: {
          $sum: { $ifNull: ['$packedListQuantity.shipping', 0] },
        },
        packedListQuantityForInvoice: {
          $sum: { $ifNull: ['$packedListQuantity.invoice', 0] },
        },
        invoicedQuantityForShipping: {
          $sum: { $ifNull: ['$invoicedQuantity.shipping', 0] },
        },
        invoicedQuantityForInvoice: {
          $sum: { $ifNull: ['$invoicedQuantity.invoice', 0] },
        },
      },
    },
    {
      $set: {
        quantity: {
          $let: {
            vars: {
              shipping: {
                $subtract: [
                  '$orderedQuantity',
                  {
                    $sum: [
                      '$packedListQuantityForShipping',
                      '$invoicedQuantityForShipping',
                    ],
                  },
                ],
              },
              invoice: {
                $subtract: [
                  '$orderedQuantity',
                  {
                    $sum: [
                      '$packedListQuantityForInvoice',
                      '$invoicedQuantityForInvoice',
                    ],
                  },
                ],
              },
            },
            in: {
              shipping: {
                $subtract: [
                  '$$shipping',
                  { $min: ['$$shipping', '$$invoice'] },
                ],
              },
              invoice: {
                $subtract: ['$$invoice', { $min: ['$$shipping', '$$invoice'] }],
              },
              all: { $max: [{ $min: ['$$shipping', '$$invoice'] }, 0] },
            },
          },
        },
      },
    },
    {
      $match: {
        $or: [
          { 'quantity.all': { $gt: 0 } },
          { 'quantity.shipping': { $gt: 0 } },
          { 'quantity.invoice': { $gt: 0 } },
        ],
      },
    },
    {
      $lookup: {
        from: modelConstants.item.collectionName,
        localField: '_id.itemId',
        foreignField: '_id',
        pipeline: [{ $project: { name: 1, price: 1, 'company.shortName': 1 } }],
        as: 'item',
      },
    },
    {
      $set: {
        item: { $first: '$item' },
      },
    },
    {
      $group: {
        _id: {
          customerId: '$_id.customerId',
          customerShippingAddressId: '$_id.customerShippingAddressId',
          isSetPack: '$_id.isSetPack',
          orderRef: '$_id.orderRef',
        },
        items: {
          $push: {
            itemId: '$_id.itemId',
            item: '$item',
            quantity: '$quantity',
          },
        },
      },
    },
    {
      $lookup: {
        from: modelConstants.customer_shipping_address.collectionName,
        localField: '_id.customerShippingAddressId',
        foreignField: '_id',
        as: 'customerShippingAddress',
      },
    },
    {
      $set: {
        customerShippingAddress: { $first: '$customerShippingAddress' },
      },
    },
    {
      $project: {
        _id: 0,
        customerId: { $toString: '$_id.customerId' },
        customerShippingAddressId: {
          $toString: '$_id.customerShippingAddressId',
        },
        'customerShippingAddress.name': 1,
        'customerShippingAddress.address': 1,
        'customerShippingAddress.phoneNumber': 1,
        isSetPack: '$_id.isSetPack',
        orderRef: '$_id.orderRef',
        'items.itemId': 1,
        'items.quantity': 1,
        'items.item': 1,
      },
    },
  ])

  return { success: true, data: packingNote }
}

export const getPackingNoteAction = withAuth(getPackingNote)
