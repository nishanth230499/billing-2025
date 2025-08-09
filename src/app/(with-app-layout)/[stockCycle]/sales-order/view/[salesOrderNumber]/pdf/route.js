'use server'

import { NextResponse } from 'next/server'

import { getSalesOrderAction } from '@/actions/salesOrderActions'
import { convertHtmlToPdfBinary } from '@/lib/utils/pdfUtls'
import SalesOrderTemplate from '@/templates/SalesOrderTemplate'

const { renderToString } = await import('react-dom/server')

export async function GET(_, { params }) {
  const { stockCycle: stockCycleId, salesOrderNumber } = await params

  const {
    success,
    data: salesOrder,
    error,
  } = await getSalesOrderAction(stockCycleId, salesOrderNumber)

  if (!success) return new NextResponse(error)

  const pdfBinary = await convertHtmlToPdfBinary(
    renderToString(<SalesOrderTemplate salesOrder={salesOrder} />),
    { title: `Sales Order ${stockCycleId}_${salesOrderNumber}` }
  )

  return new NextResponse(pdfBinary, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename='Sales Order ${stockCycleId}_${salesOrderNumber}.pdf'`,
    },
  })
}
