import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rolePermissions, canAccessApi, type UserRole } from '@/lib/permissions'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes (no auth required)
  const isHomePage = request.nextUrl.pathname === '/'
  const isPublicRoute = request.nextUrl.pathname.startsWith('/menu') || isHomePage
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')

  // Protect API routes
  if (isApiRoute) {
    // Public APIs that don't require authentication
    const isPublicApi = 
      request.nextUrl.pathname === '/api/auth/logout' ||
      request.nextUrl.pathname === '/api/auth/sync-role' ||
      request.nextUrl.pathname.startsWith('/api/auth/callback') ||
      request.nextUrl.pathname.startsWith('/api/public/')
    
    if (!user && !isPublicApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Role-based API access control (skip for public APIs)
    if (user && !isPublicApi) {
      const userRole = user.user_metadata?.role as UserRole | undefined
      const apiPath = request.nextUrl.pathname
      const method = request.method

      if (!canAccessApi(userRole, apiPath, method)) {
        return NextResponse.json(
          { error: 'Forbidden - insufficient permissions' },
          { status: 403 }
        )
      }
    }
  }

  // Redirect to login if not authenticated and not on public route
  if (!user && !isLoginPage && !isPublicRoute && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to POS if authenticated and trying to access login
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/pos', request.url))
  }

  // Role-based access control
  if (user && !isApiRoute && !isLoginPage && !isPublicRoute) {
    const userRole = user.user_metadata?.role as UserRole | undefined
    const pathname = request.nextUrl.pathname

    const allowedPaths = rolePermissions[userRole || 'WAITER'] || []
    const hasAccess = allowedPaths.some(path => pathname.startsWith(path))

    if (!hasAccess) {
      // Redirect to their default page
      const defaultPages: Record<string, string> = {
        ADMIN: '/admin',
        WAITER: '/pos',
        KITCHEN: '/kitchen',
        CASHIER: '/pos',
      }
      
      const defaultPage = defaultPages[userRole || ''] || '/pos'
      return NextResponse.redirect(new URL(defaultPage, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
