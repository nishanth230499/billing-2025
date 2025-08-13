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
        'items.for': ['shipping', 'invoice'],
        'items.orderedQuantity': '$items.quantity',
      },
    },
    { $unwind: '$items.for' },
    // TODO: Populate packedListQuantity and invoicedQuantity
    {
      $group: {
        _id: {
          customerId: '$customerId',
          customerShippingAddressId: '$customerShippingAddressId',
          isSetPack: '$isSetPack',
          orderRef: '$orderRef',
          itemId: '$items.itemId',
          for: '$items.for',
        },
        orderedQuantity: { $sum: { $ifNull: ['$items.orderedQuantity', 0] } },
        packedListQuantity: {
          $sum: { $ifNull: ['$items.packedListQuantity', 0] },
        },
        invoicedQuantity: { $sum: { $ifNull: ['$items.invoicedQuantity', 0] } },
      },
    },
    {
      $set: {
        quantity: {
          $subtract: [
            '$orderedQuantity',
            { $sum: ['$packedListQuantity', '$invoicedQuantity'] },
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          customerId: '$_id.customerId',
          customerShippingAddressId: '$_id.customerShippingAddressId',
          isSetPack: '$_id.isSetPack',
          orderRef: '$_id.orderRef',
          itemId: '$_id.itemId',
        },
        quantity: {
          $push: {
            k: '$_id.for',
            v: '$quantity',
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        quantity: { $arrayToObject: '$quantity' },
      },
    },
    {
      $set: {
        'quantity.all': { $min: ['$quantity.shipping', '$quantity.invoice'] },
      },
    },
    {
      $set: {
        'quantity.shipping': {
          $subtract: ['$quantity.shipping', '$quantity.all'],
        },
        'quantity.invoice': {
          $subtract: ['$quantity.invoice', '$quantity.all'],
        },
      },
    },
    {
      $set: {
        'quantity.all': { $max: ['$quantity.all', 0] },
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
        // items: 1,
        'items.itemId': 1,
        'items.quantity': 1,
        'items.item.name': 1,
        'items.item.price': 1,
        'items.item.company.shortName': 1,
      },
    },
  ])

  return { success: true, data: packingNote }
}

export const getPackingNoteAction = withAuth(getPackingNote)
