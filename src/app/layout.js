import './globals.css'

import { CssBaseline, InitColorSchemeScript } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import appConfig from 'appConfig'
import { Roboto } from 'next/font/google'

import theme from '../theme'
import ClientProviders from './ClientProviders'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
})

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <InitColorSchemeScript attribute='class' />
            <ClientProviders appConfig={appConfig}>
              <CssBaseline />
              {children}
            </ClientProviders>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
