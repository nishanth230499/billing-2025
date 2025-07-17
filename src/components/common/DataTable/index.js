'use client'

import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from '@mui/material'
import TableCell from '@mui/material/TableCell'
import { useCallback, useMemo, useRef } from 'react'

import { MOBILE_MAX_WIDTH } from '@/constants'

import DataRow from './DataRow'
import Pagination from './Pagination'

export default function DataTable({
  hidden,
  data,
  dataOrder,
  columns,
  totalCount,
  onDataChange,
  onDataOrderChange,
  getHighLightColor,
}) {
  const inputsRef = useRef({})

  const canUpdateOrder = useMemo(
    () => Boolean(onDataOrderChange),
    [onDataOrderChange]
  )

  const isMobileWidth = useMediaQuery(`(max-width:${MOBILE_MAX_WIDTH})`)

  const getinputsRef = useCallback((dataKey) => {
    if (!(dataKey in inputsRef.current)) inputsRef.current[dataKey] = {}
    return inputsRef.current[dataKey]
  }, [])

  const handleMoveRow = useCallback(
    (sourceDataKey, targetDataIndex) => {
      const newDataOrder = [...dataOrder]
      const sourceDataIndex = newDataOrder.indexOf(sourceDataKey)
      const movingDataKeys = newDataOrder.splice(sourceDataIndex, 1)
      newDataOrder.splice(targetDataIndex, 0, ...movingDataKeys)
      onDataOrderChange(newDataOrder)
    },
    [dataOrder, onDataOrderChange]
  )

  const handleInputKeyDown = useCallback(
    (event, dataIndex, columnKey) => {
      switch (event.key) {
        case 'ArrowUp':
          inputsRef?.current?.[dataOrder[dataIndex - 1]]?.[columnKey].select()
          event.preventDefault()
          break
        case 'ArrowDown':
          inputsRef?.current?.[dataOrder[dataIndex + 1]]?.[columnKey].select()
          event.preventDefault()
          break
        case 'ArrowLeft':
          if (
            event.target.selectionStart === 0 &&
            event.target.selectionEnd === 0 &&
            columns?.[columnKey]?.previousColumnKey
          ) {
            inputsRef?.current?.[dataOrder[dataIndex]]?.[
              columns?.[columnKey]?.previousColumnKey
            ].select()
            event.preventDefault()
          }
          break
        case 'ArrowRight':
          if (
            event.target.selectionStart === event.target.value.length &&
            event.target.selectionEnd === event.target.value.length &&
            columns?.[columnKey]?.nextColumnKey
          ) {
            inputsRef?.current?.[dataOrder[dataIndex]]?.[
              columns?.[columnKey]?.nextColumnKey
            ].select()
            event.preventDefault()
          }
          break

        default:
          return
      }
    },
    [columns, dataOrder]
  )

  const handleInputChange = useCallback(
    (event, dataKey, columnKey) => {
      const newData = { ...data }
      newData[dataKey][columnKey] = columns?.[columnKey]?.inputParser
        ? columns?.[columnKey]?.inputParser(event.target.value)
        : event.target.value
      onDataChange(newData)
    },
    [columns, data, onDataChange]
  )

  return (
    <TableContainer component={Paper} hidden={hidden}>
      <Table stickyHeader size={isMobileWidth ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            {canUpdateOrder && <TableCell className='w-[40px] pr-0' />}
            {Object.entries(columns).map(([columnKey, column]) => (
              <TableCell key={columnKey}>{column?.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataOrder?.map((dataKey, dataIndex) => (
            <DataRow
              key={dataKey}
              dataKey={dataKey}
              dataIndex={dataIndex}
              columns={columns}
              data={data?.[dataKey]}
              canUpdateOrder={canUpdateOrder}
              inputsRef={getinputsRef(dataKey)}
              handleMoveRow={handleMoveRow}
              handleInputKeyDown={(e, columnKey) =>
                handleInputKeyDown(e, dataIndex, columnKey)
              }
              handleInputChange={(e, columnKey) =>
                handleInputChange(e, dataKey, columnKey)
              }
              getHighLightColor={getHighLightColor}
            />
          ))}
        </TableBody>
      </Table>
      {totalCount ? (
        <Pagination
          totalCount={totalCount}
          className='sticky bottom-0 bg-inherit'
        />
      ) : null}
    </TableContainer>
  )
}
