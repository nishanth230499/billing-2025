import mongoose from 'mongoose'

import { formatAmount } from '@/lib/utils/amoutUtils'

import {
  AUTO_GENERATE_CUSTOMER_ID,
  CUSTOMER_ID_REGEX,
  STOCK_CYCLE_CUSTOMER_FIELDS,
} from '../../appConfig'
import { modelConstants } from './constants'
import Firm from './Firm'
import StockCycleCustomer, {
  additionalCustomerFields,
} from './StockCycleCustomer'

const customerSchema = mongoose.Schema(
  {
    ...(AUTO_GENERATE_CUSTOMER_ID
      ? {}
      : {
          _id: {
            type: String,
            match: new RegExp(CUSTOMER_ID_REGEX),
          },
        }),
    name: {
      type: String,
      required: true,
      set: (name) => name?.toUpperCase(),
    },
    place: { type: String, required: true },
    firmId: {
      type: String,
      required: true,
      ref: modelConstants?.firm?.modelName,
    },
    openingBalance: { type: Number, required: true, set: formatAmount },
    ...Object.fromEntries(
      Object.entries(additionalCustomerFields).filter(
        ([fieldName]) => !STOCK_CYCLE_CUSTOMER_FIELDS.includes(fieldName)
      )
    ),
  },
  {
    autoSearchIndex: true,
    toJSON: {
      virtuals: true,
      transform: function (_, ret) {
        delete ret.id
        delete ret.__v
        ret._id = ret?._id?.toString()
        ret.billingName = ret.stockCycleCustomer?.billingName ?? ret.billingName
        ret.billingAddress =
          ret.stockCycleCustomer?.billingAddress ?? ret.billingAddress
        ret.gstin = ret.stockCycleCustomer?.gstin ?? ret.gstin
        ret.phoneNumber = ret.stockCycleCustomer?.phoneNumber ?? ret.phoneNumber
        ret.emailId = ret.stockCycleCustomer?.emailId ?? ret.emailId
        delete ret.stockCycleCustomer
      },
    },
  }
)

customerSchema.virtual('firm', {
  ref: Firm,
  localField: 'firmId',
  foreignField: '_id',
  justOne: true,
})

customerSchema.virtual('stockCycleCustomer', {
  ref: StockCycleCustomer,
  localField: '_id',
  foreignField: 'customerId',
  justOne: true,
})

customerSchema.searchIndex({
  name: 'id_name_place_searchIndex',
  definition: {
    mappings: {
      dynamic: false,
      fields: {
        _id: {
          type: 'autocomplete',
          foldDiacritics: false,
          maxGrams: 10,
          minGrams: 2,
          tokenization: 'edgeGram',
        },
        name: [
          {
            type: 'autocomplete',
            foldDiacritics: false,
            maxGrams: 10,
            minGrams: 2,
            tokenization: 'edgeGram',
          },
          {
            type: 'string',
          },
        ],
        place: [
          {
            type: 'autocomplete',
            foldDiacritics: false,
            maxGrams: 10,
            minGrams: 2,
            tokenization: 'edgeGram',
          },
          {
            type: 'string',
          },
        ],
      },
    },
  },
})

const model = modelConstants.customer

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, customerSchema, model?.collectionName)
