import mongoose from 'mongoose'

import { formatAmount } from '@/lib/utils/amoutUtils'

import {
  AUTO_GENERATE_CUSTOMER_ID,
  CUSTOMER_ID_REGEX,
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
  {
    autoSearchIndex: true,
    toJSON: {
      transform: function (_, ret) {
        delete ret.id
        delete ret.__v
        ret._id = ret?._id?.toString()
      },
    },
  }
)

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
