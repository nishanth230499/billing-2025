import mongoose from 'mongoose'

import { customerIdRegex } from '@/lib/regex'

import {
  AUTO_GENERATE_CUSTOMER_ID,
  IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
  STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS,
} from '../../appConfig'
import { modelConstants } from './constants'

export const additionalCustomerFields = {
  billingName: {
    type: String,
    required: true,
  },
  billingAddress: {
    type: String,
    required: true,
  },
  gstin: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  emailId: {
    type: String,
  },
}

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
    firmId: {
      type: String,
      required: true,
      ref: modelConstants?.firm?.modelName,
    },
    openingBalance: { type: Number, required: true },
    ...Object.fromEntries(
      Object.entries(additionalCustomerFields).filter(
        ([fieldName]) =>
          !STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.includes(fieldName)
      )
    ),
    ...(IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE
      ? {
          stockCycleOverrides: [
            {
              _id: {
                type: String,
                required: true,
                index: true,
                unique: true,
                ref: modelConstants.stock_cycle.modelName,
              },
              ...Object.fromEntries(
                Object.entries(additionalCustomerFields).filter(([fieldName]) =>
                  STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.includes(fieldName)
                )
              ),
            },
          ],
        }
      : {}),
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
