'use client'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    dark: true,
  },
  palette: {
    action: {
      // Icon button default color
      // action color
      active: '#5f6368',
      // opacity of a selected menu item and active app bar item
      selectedOpacity: 0.2,
    },
    text: {
      // Default and primary text color
      primary: '#202124',
    },
    background: {
      // paper: '#fff',
      default: '#f8fafd',
    },
  },
  typography: {
    fontFamily: 'var(--font-roboto)',
    body1: {
      fontSize: 16,
    },
  },
  zIndex: {
    loader: 1600,
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: 16,
        },
      },
    },
  },
})

export default theme
