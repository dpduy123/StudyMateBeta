import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // First, try to refresh the session (this handles expired access tokens)
  // This is crucial for maintaining session after page reload
  let user = null
  try {
    // getUser() will automatically refresh the session if needed
    // The refreshed tokens will be set via setAll() callback above
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      // Only clear cookies for specific unrecoverable errors
      if (error.code === 'refresh_token_not_found' ||
          error.code === 'invalid_refresh_token' ||
          error.message?.includes('Invalid Refresh Token')) {
        console.warn('Invalid refresh token, clearing session:', error.code || error.message)
        // Clear all Supabase auth cookies from the response
        request.cookies.getAll().forEach(cookie => {
          if (cookie.name.startsWith('sb-')) {
            supabaseResponse.cookies.delete(cookie.name)
          }
        })
      } else {
        // For other errors (network, temporary), don't clear cookies
        // Just log and continue - user may still have valid session
        console.warn('Auth error (not clearing session):', error.message)
      }
    } else {
      user = data.user
    }
  } catch (error: unknown) {
    // Log error but DON'T clear cookies for unexpected errors
    // This prevents logout on temporary network issues
    console.error('Unexpected auth error in middleware:', error)
  }

  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/discover',
    '/messages',
    '/rooms',
    '/achievements',
    '/profile',
    '/settings',
  ]

  // Define auth routes (should redirect to dashboard if already logged in)
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if current path is auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  )

  // If user is not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Define public routes that don't require profile completion
  const publicRoutes = ['/', '/terms', '/privacy']
  const isPublicRoute = publicRoutes.includes(pathname)

  // If user is authenticated, check profile completion via user metadata
  if (user && !isPublicRoute && !pathname.startsWith('/onboarding') && !pathname.startsWith('/auth/callback') && !pathname.startsWith('/api')) {
    // Check if profile is completed from user metadata
    const profileCompleted = user.user_metadata?.profile_completed || false
    
    // If profile not completed and not on onboarding page, redirect to onboarding
    if (!profileCompleted && !pathname.startsWith('/onboarding') && !isAuthRoute) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    
    // If profile completed and trying to access onboarding, redirect to dashboard
    if (profileCompleted && pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is authenticated and on the landing page (/), redirect to dashboard
  if (user && pathname === '/') {
    const profileCompleted = user.user_metadata?.profile_completed || false
    if (profileCompleted) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}