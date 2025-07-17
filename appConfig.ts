import { modelConstants } from '@/models/constants'

export const AUTO_GENERATE_CUSTOMER_ID =
  process.env.AUTO_GENERATE_CUSTOMER_ID === 'true' ||
  process.env.AUTO_GENERATE_CUSTOMER_ID === 'True'

export const CUSTOMER_ID_REGEX = process.env.CUSTOMER_ID_REGEX ?? '/^.*$/'

export const CUSTOMER_DETAILS_SPECIFIC_TO = process.env
  .CUSTOMER_DETAILS_SPECIFIC_TO
  ? process.env.CUSTOMER_DETAILS_SPECIFIC_TO.split(',')
      .map((field) => field.trim())
      .filter((field) => field === modelConstants.stock_cycle.collectionName)
  : []

const appConfig = {
  AUTO_GENERATE_CUSTOMER_ID,
  CUSTOMER_ID_REGEX,
  CUSTOMER_DETAILS_SPECIFIC_TO,
}

export default appConfig
