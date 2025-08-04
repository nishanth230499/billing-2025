import mongoose from 'mongoose'

import { prefixRegex } from '@/lib/regex'

import {
  AUTO_GENERATE_COMPANY_ID,
  AUTO_GENERATE_ITEM_ID,
  COMPANY_ID_ITEM_ID_DELIM,
  COMPANY_ID_REGEX,
  ITEM_CODE_REGEX,
} from '../../appConfig'
import Company from './Company'
import { modelConstants } from './constants'

const itemSchema = mongoose.Schema(
  {
    ...(AUTO_GENERATE_ITEM_ID
      ? {}
      : {
          _id: {
            type: String,
            match: new RegExp(
              prefixRegex(
                COMPANY_ID_REGEX,
                COMPANY_ID_ITEM_ID_DELIM,
                ITEM_CODE_REGEX
              )
            ),
            validate: COMPANY_ID_ITEM_ID_DELIM
              ? {
                  validator: function (value) {
                    return (
                      value.split(COMPANY_ID_ITEM_ID_DELIM)[0] ===
                      this?.companyId
                    )
                  },
                  message: 'The item ID and company ID should match.',
                }
              : undefined,
          },
        }),
    name: {
      type: String,
      required: true,
    },
    group: {
      type: String,
    },
    price: { type: Number },
    tags: [{ type: String, required: true }],
    companyId: {
      type: AUTO_GENERATE_COMPANY_ID ? mongoose.Schema.Types.ObjectId : String,
      match: AUTO_GENERATE_COMPANY_ID
        ? undefined
        : new RegExp(COMPANY_ID_REGEX),
      required: true,
      ref: modelConstants?.company?.modelName,
      index: 1,
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

itemSchema.statics.dbEditorIgnoreFields = ['company']

itemSchema.methods.normalizer = async function (oldFields, session) {
  if (oldFields?.companyId?.toString() !== this.companyId?.toString()) {
    const company = await Company.findById(this.companyId, {
      _id: 1,
      name: 1,
      shortName: 1,
      tags: 1,
    })
      .session(session)
      .exec()
    if (!company) {
      throw new Error('Invalid Company ID')
    } else {
      this.company = {
        name: company.name,
        shortName: company.shortName,
        tags: company.tags,
      }
    }
  }
}

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
        company: {
          type: 'document',
          dynamic: false,
          fields: {
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
    },
  },
})

const model = modelConstants.item

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, itemSchema, model?.collectionName)
