'use client'

import { CalendarMonth } from '@mui/icons-material'
import { Box, Divider, useColorScheme } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import classNames from 'classnames'
import AppDrawerButton from './AppDrawerButton'
import Dropdown from '../common/Dropdown'
import { isMobile } from 'react-device-detect'
import { adminDrawerItems, appDrawerItems } from './AppDrawerConstants'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import { PiPasswordBold } from 'react-icons/pi'
import { useCallback, useMemo } from 'react'
import { logoutAction } from '@/actions/authActions'
import useServerAction from '@/hooks/useServerAction'
import { enqueueSnackbar } from 'notistack'
import { redirect, usePathname } from 'next/navigation'
import Link from 'next/link'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import MonitorIcon from '@mui/icons-material/Monitor'
import { UserType } from '@/models/User'

export default function AppDrawerContents({
  isDrawerExpanded,
  academicYears,
  selectedAcademicYear,
  userName,
  userType,
}) {
  const pathname = usePathname()

  const [logout, logoutLoading] = useServerAction(logoutAction)

  const handleLogout = useCallback(async () => {
    const res = await logout()
    if (res?.success) {
      enqueueSnackbar(res?.message, { variant: 'success' })
      redirect('/login')
    } else {
      enqueueSnackbar(res?.message, { variant: 'error' })
    }
  }, [logout])

  const renderDrawerItems = useCallback(
    (items) =>
      items?.map((item) => {
        if (item?.menuItems) {
          const newMenuItems = item?.menuItems?.map((menuItem) => {
            if (menuItem?.href) {
              const href =
                typeof menuItem?.href === 'function'
                  ? menuItem?.href(selectedAcademicYear)
                  : menuItem?.href
              return {
                ...menuItem,
                href: href,
                selected: href === pathname,
              }
            }
            return menuItem
          })
          const active = newMenuItems?.some(({ href }) => href === pathname)
          return (
            <Dropdown
              key={item?.key}
              button={(props) => (
                <AppDrawerButton
                  isDrawerExpanded={isDrawerExpanded}
                  startIcon={item?.icon}
                  endIcon={ArrowDropDownIcon}
                  active={active}
                  {...props}>
                  {item?.name}
                </AppDrawerButton>
              )}
              menuItems={newMenuItems}
              slotProps={{ menuItem: { component: Link } }}
            />
          )
        }
        const href =
          typeof item?.href === 'function'
            ? item?.href(selectedAcademicYear)
            : item?.href
        return (
          <AppDrawerButton
            key={item?.key}
            isDrawerExpanded={isDrawerExpanded}
            startIcon={item?.icon}
            href={href}
            active={href === pathname}
            component={Link}>
            {item?.name}
          </AppDrawerButton>
        )
      }),
    [isDrawerExpanded, pathname, selectedAcademicYear]
  )

  const { mode, setMode } = useColorScheme()

  const toggleTheme = useCallback(() => {
    switch (mode) {
      case 'light':
        setMode('dark')
        break
      case 'dark':
        setMode('system')
        break
      case 'system':
        setMode('light')
        break
    }
  }, [mode, setMode])

  const themeIcon = useMemo(() => {
    switch (mode) {
      case 'light':
        return LightModeIcon
      case 'dark':
        return DarkModeIcon
      case 'system':
        return MonitorIcon
    }
  }, [mode])

  return (
    <>
      <Box className={classNames('py-3 pr-3 flex flex-col items-start')}>
        <Dropdown
          button={(props) => (
            <AppDrawerButton
              isDrawerExpanded={isDrawerExpanded}
              startIcon={CalendarMonth}
              endIcon={ArrowDropDownIcon}
              {...props}>
              {selectedAcademicYear}
            </AppDrawerButton>
          )}
          menuItems={academicYears?.map(({ year }) => ({
            name: year,
            key: year,
            selected: year === selectedAcademicYear,
            href: `/${year}`,
          }))}
          slotProps={{ menuItem: { component: Link } }}
        />
      </Box>
      <Divider />
      <Box
        className={classNames('flex-auto overflow-auto', {
          'scrollbar-on-hover': !isMobile,
        })}>
        <Box className={classNames('py-3 pr-3 flex flex-col items-start')}>
          {renderDrawerItems(appDrawerItems)}
        </Box>
        <Divider />
        {userType === UserType.ADMIN && (
          <>
            <Box className={classNames('py-3 pr-3 flex flex-col items-start')}>
              {renderDrawerItems(adminDrawerItems)}
            </Box>
            <Divider />
          </>
        )}
      </Box>
      <Divider />
      <Box className={classNames('py-3 pr-3 flex flex-col items-start')}>
        <Dropdown
          button={(props) => (
            <AppDrawerButton
              isDrawerExpanded={isDrawerExpanded}
              startIcon={PersonIcon}
              endIcon={ArrowDropDownIcon}
              {...props}>
              {userName}
            </AppDrawerButton>
          )}
          menuItems={[
            {
              name: 'Theme',
              key: 'toggle-theme',
              onClick: toggleTheme,
              icon: themeIcon,
            },
            {
              name: 'Change Password',
              key: 'change-password',
              href: '/',
              icon: PiPasswordBold,
            },
            {
              name: 'Logout',
              key: 'logout',
              icon: LogoutIcon,
              loading: logoutLoading,
              onClick: handleLogout,
            },
          ]}
        />
      </Box>
    </>
  )
}
