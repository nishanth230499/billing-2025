'use server'

import { NextResponse } from 'next/server'

import { getSalesOrderAction } from '@/actions/salesOrderActions'
import convertJsxToPdfBinary from '@/lib/utils/pdfUtils/convertJsxToPdfBinary'
import SalesOrderTemplate from '@/templates/SalesOrderTemplate'

export async function GET(_, { params }) {
  const { stockCycle: stockCycleId, salesOrderNumber } = await params

  const {
    success,
    data: salesOrder,
    error,
  } = await getSalesOrderAction(stockCycleId, salesOrderNumber)

  if (!success) return new NextResponse(error)

  const pdfBuffer = await convertJsxToPdfBinary(
    <SalesOrderTemplate salesOrder={salesOrder} stockCycleId={stockCycleId} />,
    { title: `Sales Order ${salesOrderNumber}` }
  )

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename='Sales Order ${salesOrderNumber}.pdf'`,
    },
  })
}
