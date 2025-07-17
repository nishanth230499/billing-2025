import mongoose, { Schema } from 'mongoose'

import { customerIdRegex } from '@/lib/regex'

import {
  AUTO_GENERATE_CUSTOMER_ID,
  CUSTOMER_DETAILS_SPECIFIC_TO,
} from '../../appConfig'
import { modelConstants } from './constants'

const customerDetailsSchema = mongoose.Schema({
  customerId: AUTO_GENERATE_CUSTOMER_ID
    ? {
        type: Schema.Types.ObjectId,
        required: true,
        ref: modelConstants.customer.modelName,
      }
    : {
        type: String,
        match: customerIdRegex,
        required: true,
        ref: modelConstants?.customer.modelName,
      },
  ...(CUSTOMER_DETAILS_SPECIFIC_TO.includes(
    modelConstants.stock_cycle.collectionName
  )
    ? {
        stockCycleId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: modelConstants.stock_cycle.modelName,
        },
      }
    : {}),
  billingName: {
    type: String,
    required: true,
  },
  billingAddress: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
  },
})

customerDetailsSchema.index(
  {
    customerId: 1,
    ...(CUSTOMER_DETAILS_SPECIFIC_TO.includes(
      modelConstants.stock_cycle.collectionName
    )
      ? {
          stockCycleId: 1,
        }
      : {}),
  },
  { unique: true }
)

const model = modelConstants.customer_details

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, customerDetailsSchema, model?.collectionName)
