export function formatAmount(amount: number | string | undefined) {
  if (!amount) return amount
  if (typeof amount === 'string') return parseFloat(amount).toFixed(2)
  if (typeof amount === 'number') return amount.toFixed(2)
  return amount
}
