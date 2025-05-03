// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from './lib/session'; // Adjust path if needed
import { cookies } from 'next/headers'; // Import cookies for App Router middleware

export async function middleware(request: NextRequest) {
  const response = NextResponse.next(); // Prepare default response to allow request
  const cookieStore = await cookies(); // Get the cookie store
  // Using type assertion (as any) and passing the resolved store
  const session = await getIronSession<SessionData>(cookieStore as any, sessionOptions);
  console.log(session);

  const { isLoggedIn } = session;
  const { pathname } = request.nextUrl;

  // Define public routes (accessible without login)
  const publicRoutes = ['/', '/api/auth/login', '/api/auth/user']; // Add other public paths like /about, /contact etc.

  // Define routes accessible only when logged in
  // Using startsWith for broader matching (e.g., /patient/*)
  const protectedRoutesPrefixes = ['/patient', '/doctor', '/admin', '/onboarding', '/upload-record', '/api/user']; // Add other protected prefixes

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutesPrefixes.some(prefix => pathname.startsWith(prefix));

  // Check if the current path is considered public
  // Exact match for specific public routes, adjust if needed
  const isPublicRoute = publicRoutes.includes(pathname);

  // Redirect non-logged-in users trying to access protected routes
  if (isProtectedRoute && !isLoggedIn) {
    console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to /`);
    return NextResponse.redirect(new URL('/', request.url)); // Redirect to home/login page
  }

  // Optional: Redirect logged-in users trying to access the home/login page (/)
  // if (isLoggedIn && pathname === '/') {
  //   console.log(`[Middleware] Logged in user accessing /, redirecting to /patient`);
  //   return NextResponse.redirect(new URL('/patient', request.url)); // Redirect to default dashboard
  // }

  // Allow the request to proceed
  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api/auth/logout (allow logout always) - Handled inside middleware logic now
     * - / (the home page is handled inside middleware logic)
     * Match all API routes and pages
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};