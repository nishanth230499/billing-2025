const routes = {
  home: (stockCycleId: string) => `/${stockCycleId}`,
  customer: {
    home: (stockCycleId: string) => `/${stockCycleId}/customer`,
  },
  salesOrder: {
    home: (stockCycleId: string) => `/${stockCycleId}/sales-order`,
    create: (stockCycleId: string) => `/${stockCycleId}/sales-order/create`,
    view: (stockCycleId: string, salesOrderNumber: string) =>
      `/${stockCycleId}/sales-order/view/${salesOrderNumber}`,
    viewPDF: (stockCycleId: string, salesOrderNumber: string) =>
      `/${stockCycleId}/sales-order/view/${salesOrderNumber}/pdf`,
  },
  company: {
    home: (stockCycleId: string) => `/${stockCycleId}/companies`,
  },
  item: {
    home: (stockCycleId: string) => `/${stockCycleId}/items`,
    legend: (stockCycleId: string, itemId: string) =>
      `/${stockCycleId}/items/legend/${itemId}`,
  },
  user: { home: (stockCycleId: string) => `/${stockCycleId}/users` },
  auditLog: { home: (stockCycleId: string) => `/${stockCycleId}/audit-logs` },
  dbEditor: { home: (stockCycleId: string) => `/${stockCycleId}/db-editor` },
}

export default routes
