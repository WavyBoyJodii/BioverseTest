import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import getAuth from './lib/getAuth';
import { getUserByIdNew } from './lib/supabaseAdmin';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthenticated = await getAuth();

  // Public routes that don't require authentication
  const publicRoutes = ['/'];

  // If the route is public, allow access without further checks
  if (publicRoutes.includes(pathname)) {
    // If authenticated user tries to access login page, redirect based on role
    if (isAuthenticated) {
      const user = await getUserByIdNew();
      if (user) {
        return NextResponse.redirect(
          new URL(user.is_admin ? '/admin' : '/choices', req.url)
        );
      }
    }
    return NextResponse.next();
  }

  // For all other routes, require authentication
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Fetch user data for authenticated users
  const user = await getUserByIdNew();
  if (!user) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') && !user.is_admin) {
    return NextResponse.redirect(new URL('/choices', req.url));
  }

  // User-only routes
  if (
    (pathname.startsWith('/questionnaire') || pathname === '/choices') &&
    user.is_admin
  ) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // Prevent accessing completed questionnaires
  if (pathname.startsWith('/questionnaire')) {
    const questionnaireId = Number(pathname.split('/').pop());
    const questionnaire = user.questionnaires.find(
      (q) => q.id === questionnaireId
    );
    if (questionnaire && questionnaire.isCompleted) {
      return NextResponse.redirect(new URL('/choices', req.url));
    }
  }

  return NextResponse.next(); // Allow access if all checks pass
}
