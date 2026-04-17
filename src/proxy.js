import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/set-password'];
const adminRoutes = ['/dashboard/users', '/dashboard/clients'];

export async function proxy(req) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route));

  const sessionCookie = req.cookies.get('session')?.value;
  let session = null;

  if (sessionCookie) {
    session = await decrypt(sessionCookie);
  }

  // 1. If user is NOT logged in and tries to access a protected route
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // 2. If user is logged in, but needs to set password, restrict them to /set-password
  if (session?.requiresPasswordSet && path !== '/set-password') {
    return NextResponse.redirect(new URL('/set-password', req.nextUrl));
  }

  // 3. If user is logged in, does NOT need to set password, and tries to go to /login or /set-password
  if (session && !session.requiresPasswordSet && (path === '/login' || path === '/set-password' || path === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  // 4. Admin route protection
  if (isAdminRoute && session?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
