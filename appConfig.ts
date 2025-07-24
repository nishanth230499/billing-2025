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

const appConfig = {
  AUTO_GENERATE_CUSTOMER_ID,
  CUSTOMER_ID_REGEX,
  IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE,
  STOCK_CYCLE_SPECIFIC_CUSTOMER_FIELDS,
  AUTO_GENERATE_COMPANY_ID,
  COMPANY_ID_REGEX,
}

export default appConfig
