import mongoose from 'mongoose'

import { customerIdRegex } from '@/lib/regex'

import { AUTO_GENERATE_CUSTOMER_ID } from '../../appConfig'
import { modelConstants } from './constants'

const customerSchema = mongoose.Schema(
  {
    _id: AUTO_GENERATE_CUSTOMER_ID
      ? {}
      : {
          type: String,
          match: customerIdRegex,
        },
    name: {
      type: String,
      required: true,
      index: 1,
    },
    place: { type: String, required: true, index: 1 },
    openingBalance: { type: Number, required: true },
    firmId: {
      type: String,
      required: true,
      ref: modelConstants?.['user']?.modelName,
    },
  },
  { autoSearchIndex: true }
)

customerSchema.searchIndex({
  name: 'id_name_place_search_index',
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

const model = modelConstants.customer

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, customerSchema, model?.collectionName)
