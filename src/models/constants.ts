type ModelConstantsKeyType =
  | 'user'
  | 'stock_cycle'
  | 'audit_log'
  | 'firm'
  | 'customer'

type ModelConstantsType = {
  [key in ModelConstantsKeyType]: {
    modelName: string
    collectionName: key
  }
}

export const modelConstants: ModelConstantsType = {
  user: {
    modelName: 'User',
    collectionName: 'user',
  },
  stock_cycle: {
    modelName: 'StockCycle',
    collectionName: 'stock_cycle',
  },
  audit_log: {
    modelName: 'AuditLog',
    collectionName: 'audit_log',
  },
  firm: {
    modelName: 'Firm',
    collectionName: 'firm',
  },
  customer: {
    modelName: 'Customer',
    collectionName: 'customer',
  },
}
