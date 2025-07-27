import mongoose from 'mongoose'

import { AUTO_GENERATE_COMPANY_ID, COMPANY_ID_REGEX } from '../../appConfig'
import { modelConstants } from './constants'

const companySchema = mongoose.Schema(
  {
    _id: AUTO_GENERATE_COMPANY_ID
      ? {}
      : {
          type: String,
          match: new RegExp(COMPANY_ID_REGEX),
        },
    name: {
      type: String,
      required: true,
    },
    shortName: {
      type: String,
    },
    tags: [{ type: String, required: true }],
    address: {
      type: String,
    },
    firmId: {
      type: String,
      required: true,
      ref: modelConstants?.firm?.modelName,
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
    shippingAddress: {
      type: String,
    },
    shippingPhoneNumber: {
      type: String,
    },
  },
  { autoSearchIndex: true }
)

companySchema.searchIndex({
  name: 'id_name_shortName_tags_searchIndex',
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
        shortName: {
          type: 'autocomplete',
          foldDiacritics: false,
          maxGrams: 10,
          minGrams: 2,
          tokenization: 'edgeGram',
        },
        tags: {
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

const model = modelConstants.company

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, companySchema, model?.collectionName)
