'use client'
import './resize.css'

import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { Box } from '@mui/material'
import classNames from 'classnames'
import { Fragment } from 'react'
import { ResizableBox } from 'react-resizable'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

export default function SplitPanel({ children, direction = 'vertical' }) {
  if (Array.isArray(children)) {
    const panels = (
      <PanelGroup direction={direction}>
        {children.map((child, i) => {
          if (i === children.length - 1)
            return (
              <Panel key={child.key}>
                <Box className='overflow-auto h-full'>{child}</Box>
              </Panel>
            )
          return (
            <Fragment key={child.key}>
              <Panel>
                <Box className='overflow-auto h-full'>{child}</Box>
              </Panel>
              <PanelResizeHandle>
                <Box
                  className={classNames(
                    'flex items-center justify-center h-full'
                  )}>
                  <DragIndicatorIcon
                    className={classNames({
                      'rotate-90': direction === 'vertical',
                    })}
                  />
                </Box>
              </PanelResizeHandle>
            </Fragment>
          )
        })}
      </PanelGroup>
    )
    return (
      <div className={classNames('h-full overflow-y-auto pb-8')}>
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
