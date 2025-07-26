export function parseJsonString(jsonString: string) {
  try {
    return JSON.parse(jsonString)
  } catch {
    return undefined
  }
}
