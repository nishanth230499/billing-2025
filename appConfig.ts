export const AUTO_GENERATE_CUSTOMER_ID =
  process.env.AUTO_GENERATE_CUSTOMER_ID === 'true' ||
  process.env.AUTO_GENERATE_CUSTOMER_ID === 'True'

export const CUSTOMER_ID_REGEX = process.env.CUSTOMER_ID_REGEX ?? '/^.*$/'

export const IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE =
  process.env.IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE === 'true' ||
  process.env.IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE === 'True'

export const STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS = process.env
  .STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS
  ? process.env.STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS.split(',').map((field) =>
      field.trim()
    )
  : []

const appConfig = {
  AUTO_GENERATE_CUSTOMER_ID,
  CUSTOMER_ID_REGEX,
  IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
  STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS,
}

export default appConfig
