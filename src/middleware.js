import { createSession, verifySession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }
  try {
    const { userId, verifyType } = await verifySession()
    const requestHeaders = new Headers(request.headers)
    // TODO: Check if tokens are issued after the password was changed
    // TODO: Check if the user is active
    requestHeaders.set('x-loggedin-user', userId)
    requestHeaders.set('x-current-path', request.nextUrl.pathname)

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    if (verifyType === 'refreshToken') {
      await createSession(response.cookies, userId)
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
