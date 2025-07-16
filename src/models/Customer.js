import mongoose from 'mongoose'

import { customerIdRegex } from '@/lib/regex'

import { AUTO_GENERATE_CUSTOMER_ID } from '../../appConfig'
import { modelConstants } from './constants'

const customerSchema = mongoose.Schema({
  _id: AUTO_GENERATE_CUSTOMER_ID
    ? {}
    : {
        type: String,
        required: true,
        unique: true,
        index: true,
        match: customerIdRegex,
      },
  name: {
    type: String,
    required: true,
  },
  place: { type: String, required: true },
  opening_balance: { type: Number, required: true },
  firm_id: {
    type: String,
    required: true,
    ref: modelConstants?.['user']?.modelName,
  },
})

const model = modelConstants.customer

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, customerSchema, model?.collectionName)
