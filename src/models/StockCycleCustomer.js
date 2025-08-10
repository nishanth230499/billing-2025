import mongoose from 'mongoose'

import {
  AUTO_GENERATE_CUSTOMER_ID,
  CUSTOMER_ID_REGEX,
  STOCK_CYCLE_CUSTOMER_FIELDS,
} from '../../appConfig'
import { modelConstants } from './constants'

export const additionalCustomerFields = {
  billingName: {
    type: String,
    required: true,
    set: (name) => name?.toUpperCase(),
  },
  billingAddress: {
    type: String,
    required: true,
  },
  gstin: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  emailId: {
    type: String,
    default: '',
  },
}

const stockCycleCustomerSchema = mongoose.Schema(
  {
    stockCycleId: {
      type: String,
      required: true,
      ref: modelConstants.stock_cycle.modelName,
    },
    customerId: {
      type: AUTO_GENERATE_CUSTOMER_ID ? mongoose.Schema.Types.ObjectId : String,
      match: AUTO_GENERATE_CUSTOMER_ID
        ? undefined
        : new RegExp(CUSTOMER_ID_REGEX),
      required: true,
      ref: modelConstants.customer.modelName,
    },
    ...Object.fromEntries(
      Object.entries(additionalCustomerFields).filter(([fieldName]) =>
        STOCK_CYCLE_CUSTOMER_FIELDS.includes(fieldName)
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
        ret.customerId = ret?.customerId?.toString()
      },
    },
  }
)

stockCycleCustomerSchema.searchIndex({
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
        name: {
          type: 'autocomplete',
          foldDiacritics: false,
          maxGrams: 10,
          minGrams: 2,
          tokenization: 'edgeGram',
        },
        place: {
          type: 'autocomplete',
          foldDiacritics: false,
          maxGrams: 10,
          minGrams: 2,
          tokenization: 'edgeGram',
        },
      },
    },
  },
})

const model = modelConstants.stock_cycle_customer

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(
    model?.modelName,
    stockCycleCustomerSchema,
    model?.collectionName
  )
