import mongoose from 'mongoose'

import { prefixRegex } from '@/lib/regex'
import { dateStringValidator } from '@/lib/utils/dateUtils'

import {
  AUTO_GENERATE_CUSTOMER_ID,
  AUTO_GENERATE_ITEM_ID,
  COMPANY_ID_ITEM_ID_DELIM,
  COMPANY_ID_REGEX,
  CUSTOMER_ID_REGEX,
  ITEM_CODE_REGEX,
} from '../../appConfig'
import { modelConstants } from './constants'

const salesOrderItemSchema = new mongoose.Schema({
  itemId: {
    type: AUTO_GENERATE_ITEM_ID ? mongoose.Schema.Types.ObjectId : String,
    match: AUTO_GENERATE_ITEM_ID
      ? undefined
      : new RegExp(
          prefixRegex(
            COMPANY_ID_REGEX,
            COMPANY_ID_ITEM_ID_DELIM,
            ITEM_CODE_REGEX
          )
        ),
    required: true,
    ref: modelConstants.item.modelName,
  },
  group: {
    type: String,
    default: '',
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity should not be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity should be integer.',
    },
  },
  unitQuantity: {
    type: Number,
    required: true,
    min: [0, 'Unit Quantity should not be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Unit Quantity should be integer.',
    },
  },
})

const salesOrderSchema = new mongoose.Schema(
  {
    stockCycleId: {
      type: String,
      required: true,
      ref: modelConstants.stock_cycle.modelName,
    },
    number: {
      type: Number,
      required: true,
      min: [1, 'Order Number should be positive'],
      validate: {
        validator: Number.isInteger,
        message: 'Order number should be a counting number.',
      },
    },
    customerId: {
      type: AUTO_GENERATE_CUSTOMER_ID ? mongoose.Schema.Types.ObjectId : String,
      match: AUTO_GENERATE_CUSTOMER_ID
        ? undefined
        : new RegExp(CUSTOMER_ID_REGEX),
      required: true,
      ref: modelConstants.customer.modelName,
    },
    customerShippingAddressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: modelConstants.customer_shipping_address.modelName,
    },
    supplyDate: {
      type: String,
      required: true,
      validate: {
        validator: dateStringValidator,
        message: 'The supply date should be valid.',
      },
    },
    orderRef: {
      type: String,
      default: '',
    },
    isSetPack: {
      type: Boolean,
      required: true,
      default: false,
    },
    items: { type: [salesOrderItemSchema], required: true },
  },
  {
    toJSON: {
      transform: function (_, ret: any) {
        delete ret.id
        delete ret.__v

        ret._id = ret?._id?.toString()
        ret.customerId = ret?.customerId?.toString()
        ret.customerShippingAddressId =
          ret?.customerShippingAddressId?.toString()
        ret.items.forEach((item: any) => {
          item.itemId = item?.itemId?.toString()
        })
      },
    },
  }
)

const model = modelConstants.sales_order

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, salesOrderSchema, model?.collectionName)
