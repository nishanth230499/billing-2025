export const AUTO_GENERATE_CUSTOMER_ID =
  process.env.AUTO_GENERATE_CUSTOMER_ID === 'true' ||
  process.env.AUTO_GENERATE_CUSTOMER_ID === 'True'

export const CUSTOMER_ID_REGEX = process.env.CUSTOMER_ID_REGEX ?? '^.*$'

export const IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE =
  process.env.IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE === 'true' ||
  process.env.IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE === 'True'

export const STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS = process.env
  .STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS
  ? process.env.STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.split(',').map((field) =>
      field.trim()
    )
  : []

export const AUTO_GENERATE_COMPANY_ID =
  process.env.AUTO_GENERATE_COMPANY_ID === 'true' ||
  process.env.AUTO_GENERATE_COMPANY_ID === 'True'

export const COMPANY_ID_REGEX = process.env.COMPANY_ID_REGEX ?? '^.*$'

export const AUTO_GENERATE_ITEM_ID =
  process.env.AUTO_GENERATE_ITEM_ID === 'true' ||
  process.env.AUTO_GENERATE_ITEM_ID === 'True'

export const COMPANY_ID_ITEM_ID_DELIM =
  AUTO_GENERATE_COMPANY_ID === false && AUTO_GENERATE_ITEM_ID === false
    ? process.env.COMPANY_ID_ITEM_ID_DELIM
    : undefined

export const ITEM_CODE_REGEX = process.env.ITEM_CODE_REGEX ?? '^d{5}$'

export const AUTO_INCREMENT_ITEM_CODE =
  process.env.AUTO_INCREMENT_ITEM_CODE === 'true' ||
  process.env.AUTO_INCREMENT_ITEM_CODE === 'True'

export const ITEM_CODE_DIGITS_COUNT = process.env.ITEM_CODE_DIGITS_COUNT
  ? parseInt(process.env.ITEM_CODE_DIGITS_COUNT)
  : undefined

const appConfig = {
  AUTO_GENERATE_CUSTOMER_ID,
  CUSTOMER_ID_REGEX,
  IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
  STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS,
  AUTO_GENERATE_COMPANY_ID,
  COMPANY_ID_REGEX,
  AUTO_GENERATE_ITEM_ID,
  COMPANY_ID_ITEM_ID_DELIM,
  ITEM_CODE_REGEX,
  AUTO_INCREMENT_ITEM_CODE,
  ITEM_CODE_DIGITS_COUNT,
}

export default appConfig
