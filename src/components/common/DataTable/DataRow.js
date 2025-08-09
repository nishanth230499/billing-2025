'use client'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { Link, TableCell, TableRow } from '@mui/material'
import classNames from 'classnames'
import React, { memo, useCallback } from 'react'
import { useDrag, useDrop } from 'react-dnd'

import DataInput from './DataInput'

function DataRow({
  dataKey,
  dataIndex,
  canUpdateOrder,
  columns,
  data,
  inputsRef,
  handleInputKeyDown,
  handleInputChange,
  handleMoveRow,
}) {
  // console.log('Data Row Rerendered', data?.group)
  const setInputRef = useCallback(
    (ele, columnKey) => {
      inputsRef[columnKey] = ele
    },
    [inputsRef]
  )

  const [, drag, dragPreview] = useDrag(
    () => ({
      type: 'tableRow',
      item: { dataKey, originalDataIndex: dataIndex },

      end: (item, monitor) => {
        const { dataKey: draggedDataKey, originalDataIndex } = item
        const didDrop = monitor.didDrop()
        if (!didDrop) {
          handleMoveRow(draggedDataKey, originalDataIndex)
        }
      },
    }),
    [dataKey, dataIndex, handleMoveRow]
  )

  const [{ isDragging }, drop] = useDrop(
    () => ({
      accept: 'tableRow',
      hover: ({ dataKey: draggedDataKey }) => {
        if (draggedDataKey !== dataKey) {
          handleMoveRow(draggedDataKey, dataIndex)
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.getItem()?.dataKey === dataKey,
      }),
    }),
    [handleMoveRow]
  )

  const onKeyDown = useCallback(
    (e, columnKey) => handleInputKeyDown(e, dataIndex, columnKey),
    [dataIndex, handleInputKeyDown]
  )

  const onChange = useCallback(
    (v, columnKey) => handleInputChange(v, dataKey, columnKey),
    [dataKey, handleInputChange]
  )

  return (
    <TableRow
      hover
      ref={(ele) => dragPreview(drop(ele))}
      sx={{
        opacity: isDragging ? 0.3 : 1,
        '& > td:first-child': {
          borderLeft: data?._metaData?.highlightColor
            ? `4px solid ${data?._metaData?.highlightColor}`
            : undefined,
        },
      }}>
      {canUpdateOrder && (
        <TableCell
          ref={drag}
          className={classNames('cursor-grab w-[40px] pr-0', {
            'border-inherit border-t border-b border-dashed': isDragging,
          })}>
          <DragIndicatorIcon />
        </TableCell>
      )}
      {Object.entries(columns).map(([columnKey, column]) => (
        <TableCell
          key={columnKey}
          className={classNames({
            'border-inherit border-t border-b border-dashed': isDragging,
          })}
          {...(column?.slotProps?.tableBodyCell || {})}>
          {(() => {
            if (column?.component) {
              return column?.component({ dataKey, data })
            }
            if (column?.editable) {
              return (
                <DataInput
                  column={column}
                  columnKey={columnKey}
                  data={data}
                  setInputRef={setInputRef}
                  onKeyDown={onKeyDown}
                  onChange={onChange}
                />
              )
            }
            if (column?.href) {
              return (
                <Link href={column?.href(data)} className='underline'>
                  {column?.format ? column?.format(data) : data?.[columnKey]}
                </Link>
              )
            }
            return column?.format ? column?.format(data) : data?.[columnKey]
          })()}
        </TableCell>
      ))}
    </TableRow>
  )
}

export default memo(DataRow, (prevProps, nextProps) => {
  const dataEqual =
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  // if (nextProps.data.group === 'Nursery') console.log(dataEqual)

  for (const key in prevProps) {
    if (key !== 'data') {
      if (prevProps[key] !== nextProps[key]) {
        // if (nextProps.data.group === 'Nursery') console.log(key)
        return false
      }
    }
  }

  for (const key in nextProps) {
    if (key !== 'data' && !(key in prevProps)) {
      // if (nextProps?.data?.group === 'Nursery') console.log(key)
      return false
    }
  }
  return dataEqual
})
