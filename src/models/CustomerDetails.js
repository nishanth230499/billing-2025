import mongoose, { Schema } from 'mongoose'

import { customerIdRegex } from '@/lib/regex'

import {
  AUTO_GENERATE_CUSTOMER_ID,
  CUSTOMER_DETAILS_SPECIFIC_TO,
} from '../../appConfig'
import { modelConstants } from './constants'

const customerDetailsSchema = mongoose.Schema({
  _id: AUTO_GENERATE_CUSTOMER_ID
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
        stock_cycle_id: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: modelConstants.stock_cycle.modelName,
        },
      }
    : {}),
  billing_name: {
    type: String,
    required: true,
  },
  billing_address: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  email_address: {
    type: String,
    required: true,
  },
})

customerDetailsSchema.index(
  {
    _id: 1,
    ...(CUSTOMER_DETAILS_SPECIFIC_TO.includes(
      modelConstants.stock_cycle.collectionName
    )
      ? {
          stock_cycle_id: 1,
        }
      : {}),
  },
  { unique: true }
)

const model = modelConstants.customer_details

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, customerDetailsSchema, model?.collectionName)
