import { CircularProgress, Icon, Menu, MenuItem } from '@mui/material'
import classNames from 'classnames'
import { useState } from 'react'

export default function Dropdown({ button, menuItems = [], slotProps = {} }) {
  const { menuItem: menuItemProps = {} } = slotProps
  const [anchorEle, setAnchorEle] = useState(null)
  const open = Boolean(anchorEle)
  const handleClick = (event) => {
    setAnchorEle(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEle(null)
  }
  return (
    <>
      {button({ onClick: handleClick })}
      <Menu anchorEl={anchorEle} open={open} onClose={handleClose}>
        {menuItems.map(
          ({ icon, key, name, href, selected, onClick, loading }) => (
            <MenuItem
              className={classNames('gap-3 w-full', {
                'font-medium': selected,
              })}
              key={key}
              href={href}
              component={href ? 'a' : undefined}
              selected={selected}
              onClick={onClick}
              disabled={loading}
              {...menuItemProps}>
              {loading ? (
                <CircularProgress size={24} color='action' />
              ) : (
                icon && (
                  <Icon fontSize='small' component={icon} color='action' />
                )
              )}

              {name}
            </MenuItem>
          )
        )}
      </Menu>
    </>
  )
}
