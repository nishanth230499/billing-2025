import mongoose from 'mongoose'

import { prefixRegex } from '@/lib/regex'

import {
  AUTO_GENERATE_COMPANY_ID,
  AUTO_GENERATE_ITEM_ID,
  COMPANY_ID_ITEM_ID_DELIM,
  COMPANY_ID_REGEX,
  ITEM_ID_REGEX,
} from '../../appConfig'
import { modelConstants } from './constants'

const itemSchema = mongoose.Schema(
  {
    _id: AUTO_GENERATE_ITEM_ID
      ? {}
      : {
          type: String,
          match: new RegExp(
            prefixRegex(
              COMPANY_ID_REGEX,
              COMPANY_ID_ITEM_ID_DELIM,
              ITEM_ID_REGEX
            )
          ),
          // validator:
        },
    name: {
      type: String,
      required: true,
    },
    group: {
      type: String,
    },
    tags: [{ type: String, required: true }],
    companyId: {
      type: AUTO_GENERATE_COMPANY_ID ? mongoose.Schema.Types.ObjectId : String,
      required: true,
      ref: modelConstants?.company?.modelName,
    },
    company: {
      name: {
        type: String,
        required: true,
      },
      shortName: {
        type: String,
      },
      tags: [{ type: String, required: true }],
    },
    hsnId: {
      type: String,
      required: true,
      ref: modelConstants?.hsn?.modelName,
    },
  },
  { autoSearchIndex: true }
)

export const dbEditorIgnoreFields = ['company']

itemSchema.searchIndex({
  name: 'id_name_tags_company_searchIndex',
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
        tags: {
          type: 'autocomplete',
          foldDiacritics: false,
          maxGrams: 10,
          minGrams: 2,
          tokenization: 'edgeGram',
        },
        'company.name': {
          type: 'autocomplete',
          foldDiacritics: false,
          maxGrams: 10,
          minGrams: 2,
          tokenization: 'edgeGram',
        },
        'company.shortName': {
          type: 'autocomplete',
          foldDiacritics: false,
          maxGrams: 10,
          minGrams: 2,
          tokenization: 'edgeGram',
        },
        'company.tags': {
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
  mongoose.model(model?.modelName, itemSchema, model?.collectionName)
