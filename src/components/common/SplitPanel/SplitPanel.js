'use client'
import './resize.css'

import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import { Box, ButtonBase, Paper } from '@mui/material'
import classNames from 'classnames'
import { Fragment, useCallback, useState } from 'react'
import { ResizableBox } from 'react-resizable'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

export default function SplitPanel({
  children,
  defaultDirection = 'horizontal',
}) {
  const [direction, setDirection] = useState(defaultDirection)

  const toggleDirection = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDirection((dir) => (dir === 'vertical' ? 'horizontal' : 'vertical'))
  }, [])

  if (Array.isArray(children)) {
    const panels = (
      <PanelGroup direction={direction}>
        {children.map((child, i) => {
          if (i === children.length - 1)
            return (
              <Panel key={child.key}>
                <Paper className='overflow-auto h-full flex flex-col p-4'>
                  {child}
                </Paper>
              </Panel>
            )
          return (
            <Fragment key={child.key}>
              <Panel>
                <Paper className='overflow-auto h-full flex flex-col p-4'>
                  {child}
                </Paper>
              </Panel>
              <PanelResizeHandle>
                <Box
                  className={classNames(
                    'flex items-center justify-center h-full gap-2',
                    { 'flex-col': direction === 'horizontal' }
                  )}>
                  <DragIndicatorIcon
                    className={classNames({
                      'rotate-90': direction === 'vertical',
                    })}
                  />
                  <ButtonBase
                    className='cursor-pointer'
                    onClick={toggleDirection}>
                    <RotateLeftIcon />
                  </ButtonBase>
                </Box>
              </PanelResizeHandle>
            </Fragment>
          )
        })}
      </PanelGroup>
    )
    return (
      <div
        className={classNames('h-full overflow-y-auto', {
          'pb-8': direction === 'vertical',
        })}>
        {direction === 'vertical' ? (
          <ResizableBox className={`react-resizable-y`} height={1000} axis='y'>
            {panels}
          </ResizableBox>
        ) : (
          panels
        )}
      </div>
    )
  }
  return children
}
