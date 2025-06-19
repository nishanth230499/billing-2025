export default class NoAuthError extends Error {
  constructor() {
    super('Not Authenticated')
    this.name = 'NoAuthError'
  }
}
