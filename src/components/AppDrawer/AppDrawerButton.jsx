import { alpha, Box, Button, Icon, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'

export default function AppDrawerButton({
  startIcon,
  children,
  endIcon,
  isDrawerExpanded,
  onClick,
  href,
  tooltipTitle,
  active,
  component,
}) {
  return (
    <Tooltip
      placement='right'
      title={isDrawerExpanded ? '' : tooltipTitle ?? children}>
      <Button
        component={component}
        className={classNames(
          'justify-between truncate min-h-10 min-w-0 normal-case',
          {
            'px-5 rounded-l-none rounded-r-3xl': isDrawerExpanded,
            'px-2 ml-3 rounded-3xl': !isDrawerExpanded,
          }
        )}
        sx={
          active
            ? {
                background: (theme) =>
                  alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity
                  ),
              }
            : {}
        }
        fullWidth={isDrawerExpanded}
        onClick={onClick}
        href={href}
        color='inherit'>
        <Box className='flex items-center gap-4'>
          <Icon component={startIcon} color='action' />
          {isDrawerExpanded ? (
            <Typography className={classNames({ 'font-medium': active })}>
              {children}
            </Typography>
          ) : null}
        </Box>
        {isDrawerExpanded && endIcon ? (
          <Icon component={endIcon} color='action' />
        ) : null}
      </Button>
    </Tooltip>
  )
}
