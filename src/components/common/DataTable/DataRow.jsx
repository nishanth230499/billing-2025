'use client'
import { Input, TableCell, TableRow, Typography } from '@mui/material'
import React, { useCallback } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import classNames from 'classnames'

export default function DataRow({
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
  const setInputRef = useCallback(
    (ele, columnKey) => {
      inputsRef[columnKey] = ele
    },
    [inputsRef]
  )

  const [_, drag, dragPreview] = useDrag(
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
              return column?.component({ dataKey, data, columnKey })
            }
            if (column?.editable) {
              const error = column?.validator && !column?.validator(data)
              return (
                <Input
                  inputRef={(ele) => setInputRef(ele, columnKey)}
                  onKeyDown={(e) => handleInputKeyDown(e, columnKey)}
                  value={
                    (column?.format
                      ? column?.format(data)
                      : data?.[columnKey]) ?? ''
                  }
                  onChange={(e) => handleInputChange(e, columnKey)}
                  error={error}
                  inputProps={{ enterKeyHint: 'Done' }}
                  enterKeyHint='done'
                  sx={{
                    borderBottomWidth: error ? 2 : undefined,
                    borderBottomColor: (theme) => theme.palette.error.main,
                  }}
                />
              )
            }
            return column?.format ? column?.format(data) : data?.[columnKey]
          })()}
        </TableCell>
      ))}
    </TableRow>
  )
}
