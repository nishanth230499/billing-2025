import { dateRegex } from '../regex'

export function formatForDateTimeInput(isoDateString: string): string {
  if (!isoDateString) return ''
  const date = new Date(isoDateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function dateStringValidator(dateString: string) {
  return dateRegex.test(dateString) && !isNaN(new Date(dateString).getTime())
}

export function getCurrentDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
