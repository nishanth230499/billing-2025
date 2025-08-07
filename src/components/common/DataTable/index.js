'use client'

import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from '@mui/material'
import TableCell from '@mui/material/TableCell'
import { memo, useCallback, useMemo, useRef } from 'react'

import { MOBILE_MAX_WIDTH } from '@/constants'

import DataRow from './DataRow'
import Pagination from './Pagination'

function DataTable({
  hidden,
  data,
  dataOrder,
  columns,
  paginationProps,
  setData,
  setDataOrder,
  onEnterPress,
  className,
}) {
  console.log('Table Rerendered')
  const inputsRef = useRef({})

  const canUpdateOrder = useMemo(() => Boolean(setDataOrder), [setDataOrder])

  const isMobileWidth = useMediaQuery(`(max-width:${MOBILE_MAX_WIDTH})`)

  const getinputsRef = useCallback((dataKey) => {
    if (!(dataKey in inputsRef.current)) inputsRef.current[dataKey] = {}
    return inputsRef.current[dataKey]
  }, [])

  const handleMoveRow = useCallback(
    (sourceDataKey, targetDataIndex) => {
      setDataOrder((dataOrder) => {
        const newDataOrder = [...dataOrder]
        const sourceDataIndex = newDataOrder.indexOf(sourceDataKey)
        const movingDataKeys = newDataOrder.splice(sourceDataIndex, 1)
        newDataOrder.splice(targetDataIndex, 0, ...movingDataKeys)
        return newDataOrder
      })
    },
    [setDataOrder]
  )

  const handleInputKeyDown = useCallback(
    (event, dataIndex, columnKey) => {
      switch (event.key) {
        case 'ArrowUp':
          inputsRef?.current?.[dataOrder[dataIndex - 1]]?.[columnKey].select()
          event.preventDefault()
          break
        case 'Enter':
          onEnterPress &&
            onEnterPress({
              dataKey: dataOrder[dataIndex],
              columnKey,
              value: event.target.value,
            })
          inputsRef?.current?.[dataOrder[dataIndex + 1]]?.[columnKey].select()
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
    [columns, dataOrder, onEnterPress]
  )

  const handleInputChange = useCallback(
    (value, dataKey, columnKey) => {
      setData((data) => {
        const newData = { ...data }
        newData[dataKey] = {
          ...newData[dataKey],
          [columnKey]: columns?.[columnKey]?.inputParser
            ? columns?.[columnKey]?.inputParser(value)
            : value,
        }

        return newData
      })
    },
    [columns, setData]
  )

  return (
    <TableContainer
      hidden={hidden}
      className={`min-h-60 flex flex-col justify-between ${className}`}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}>
      <Table stickyHeader size={isMobileWidth ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            {canUpdateOrder && (
              <TableCell
                className='w-[40px] pr-0'
                sx={{ backgroundImage: 'var(--mui-overlays-8)' }}
              />
            )}
            {Object.entries(columns).map(([columnKey, column]) => (
              <TableCell
                key={columnKey}
                sx={{ backgroundImage: 'var(--mui-overlays-8)' }}>
                {column?.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataOrder?.map((dataKey, dataIndex) => (
            // Do not define any inline function, the reference of the function will change, and the memo of DataRow will not work, and leads to unnecessary rerendering
            <DataRow
              key={dataKey}
              dataKey={dataKey}
              dataIndex={dataIndex}
              columns={columns}
              data={data?.[dataKey]}
              canUpdateOrder={canUpdateOrder}
              inputsRef={getinputsRef(dataKey)}
              handleMoveRow={handleMoveRow}
              handleInputKeyDown={handleInputKeyDown}
              handleInputChange={handleInputChange}
            />
          ))}
        </TableBody>
      </Table>
      {paginationProps?.totalCount ? <Pagination {...paginationProps} /> : null}
    </TableContainer>
  )
}

export default memo(DataTable)
