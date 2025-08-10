'use server'

import { NextResponse } from 'next/server'

import { getSalesOrderAction } from '@/actions/salesOrderActions'
import convertHtmlToPdfBinary from '@/lib/utils/pdfUtils/convertHtmlToPdfBinary'
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

  const pdfBuffer = await convertHtmlToPdfBinary(
    renderToString(
      <SalesOrderTemplate salesOrder={salesOrder} stockCycleId={stockCycleId} />
    ),
    { title: `Sales Order ${salesOrderNumber}` }
  )

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename='Sales Order ${salesOrderNumber}.pdf'`,
    },
  })
}
