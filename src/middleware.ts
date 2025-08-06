import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ['/analyzer']
  const adminRoutes = ['/admin']

  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )

  const isAdminRoute = adminRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )

  // Handle auth callback (email confirmation)
  if (req.nextUrl.pathname === '/auth/callback') {
    return res
  }

  // Redirect to login if trying to access protected route without session
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin access for admin routes
  if (isAdminRoute && session) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Check for admin session in cookies/headers (bypass Supabase auth for admin)
  if (isAdminRoute && !session) {
    // Check if this is an admin access attempt
    const adminSession = req.cookies.get('gmilli_admin_session')?.value
    if (adminSession !== 'true') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    // Allow admin access even without Supabase session
    return res
  }

  // If user is logged in and tries to access login/signup, redirect to home
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
