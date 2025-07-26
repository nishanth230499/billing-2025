export function parseJsonString(jsonString: string) {
  if (jsonString === '') return {}
  try {
    return JSON.parse(jsonString)
  } catch {
    return undefined
  }
}
