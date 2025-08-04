import mongoose from 'mongoose'

import { AUTO_GENERATE_CUSTOMER_ID, CUSTOMER_ID_REGEX } from '../../appConfig'
import { modelConstants } from './constants'

const customerShippingAddressSchema = mongoose.Schema({
  customerId: {
    type: AUTO_GENERATE_CUSTOMER_ID ? mongoose.Schema.Types.ObjectId : String,
    match: AUTO_GENERATE_CUSTOMER_ID
      ? undefined
      : new RegExp(CUSTOMER_ID_REGEX),
    required: true,
    ref: modelConstants.customer.modelName,
    index: 1,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
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
})

const model = modelConstants.customer_shipping_address

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(
    model?.modelName,
    customerShippingAddressSchema,
    model?.collectionName
  )
