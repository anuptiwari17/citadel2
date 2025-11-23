// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  id: number
  email: string
  role: 'Admin' | 'Librarian' | 'Student' | 'Faculty'
  memberId: string
  iat?: number
  exp?: number
}

const JWT_SECRET = process.env.JWT_SECRET!

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('citadel-auth')?.value
  const { pathname } = req.nextUrl

  // Public routes — allow without login
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname === '/') {
    return NextResponse.next()
  }

  // Protected routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/librarian') || pathname.startsWith('/member')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload

      // Role-based access control
      if (pathname.startsWith('/admin') && payload.role !== 'Admin') {
        return NextResponse.redirect(new URL('/member', req.url))
      }
      if (pathname.startsWith('/librarian') && payload.role !== 'Librarian') {
        return NextResponse.redirect(new URL('/member', req.url))
      }

      // Attach user to request headers (optional for APIs)
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-user-id', String(payload.id))
      requestHeaders.set('x-user-role', payload.role)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL('/login', req.url))
      response.cookies.delete('citadel-auth')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/librarian/:path*',
    '/member/:path*',
    '/login',
    '/signup'
  ]
}