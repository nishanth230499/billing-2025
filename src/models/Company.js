import mongoose from 'mongoose'

import { AUTO_GENERATE_COMPANY_ID, COMPANY_ID_REGEX } from '../../appConfig'
import { modelConstants } from './constants'
import Item from './Item'

const companySchema = mongoose.Schema(
  {
    ...(AUTO_GENERATE_COMPANY_ID
      ? {}
      : {
          _id: {
            type: String,
            match: new RegExp(COMPANY_ID_REGEX),
          },
        }),
    name: {
      type: String,
      required: true,
    },
    shortName: {
      type: String,
      default: '',
    },
    tags: [{ type: String, required: true }],
    address: {
      type: String,
      default: '',
    },
    firmId: {
      type: String,
      required: true,
      ref: modelConstants?.firm?.modelName,
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
    shippingAddress: {
      type: String,
      default: '',
    },
    shippingPhoneNumber: {
      type: String,
      default: '',
    },
  },
  {
    autoSearchIndex: true,
    toJSON: {
      virtuals: true,
      transform: function (_, ret) {
        delete ret.id
        delete ret.__v
        ret._id = ret?._id?.toString()
      },
    },
  }
)

companySchema.virtual('firm', {
  ref: modelConstants?.firm?.modelName,
  localField: 'firmId',
  foreignField: '_id',
  justOne: true,
})

companySchema.methods.normalizer = async function (oldDocument, session) {
  if (
    oldDocument?.name !== this.name ||
    oldDocument?.shortName !== this?.shortName ||
    JSON.stringify(oldDocument?.tags) !== JSON.stringify(this?.tags)
  ) {
    await Item.updateMany(
      {
        companyId: this._id,
      },
      {
        $set: {
          company: {
            name: this?.name,
            shortName: this?.shortName,
            tags: this?.tags,
          },
        },
      },
      { runValidators: true, session }
    )
  }
}

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
