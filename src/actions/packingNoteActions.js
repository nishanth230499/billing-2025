export const packingNotePipeline = [
  { $unwind: '$items' },
  {
    $set: {
      'items.for': ['shipping', 'invoice'],
      'items.orderedQuantity': '$items.quantity',
    },
  },
  { $unwind: '$items.for' },
  // TODO: POpulate packedListQuantity and invoicedQuantity
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
      'quantity.invoice': { $subtract: ['$quantity.invoice', '$quantity.all'] },
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
          quantity: '$quantity',
        },
      },
    },
  },
]
