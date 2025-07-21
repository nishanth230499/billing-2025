import { CUSTOMER_ID_REGEX } from 'appConfig'

export const nonEmptyRegex = new RegExp(/^(?!\s*$).+$/)

export const multilineNonEmptyRegex = new RegExp(/^(?!\s*$).+$/m)

export const emailRegex = new RegExp(
  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
)

export const passwordRegex = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/
)

export const customerIdRegex = new RegExp(CUSTOMER_ID_REGEX)

export const amountRegex = new RegExp(/^\d+(\.\d{1,2})?$/)

export const negativeAmountRegex = new RegExp(/^-?\d+(\.\d{1,2})?$/)
