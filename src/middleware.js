import { NextResponse } from 'next/server'

import createSession from './lib/session/createSession'
import verifySession from './lib/session/verifySession'

export async function middleware(request) {
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }
  try {
    const { userId, verifyType, loggedinAt } = await verifySession()
    const requestHeaders = new Headers(request.headers)

    requestHeaders.set('x-loggedin-user-id', userId)
    requestHeaders.set('x-loggedin-at', loggedinAt)
    requestHeaders.set('x-current-path', request.nextUrl.pathname)

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    if (verifyType === 'refreshToken') {
      await createSession(response.cookies, userId, loggedinAt)
    }
    return response
  } catch (e) {
    console.log(e)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
