// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes không cần auth
const publicRoutes = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/about',
  '/contact',
  // Thêm các public route khác của bạn
]);

// Routes cần auth
const protectedRoutes = createRouteMatcher([
  '/dashboard(.*)',
  '/courses(.*)',
  '/profile(.*)',
  // Thêm các protected route khác của bạn
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // Nếu user chưa đăng nhập
  if (!userId) {
    // Nếu truy cập protected route, redirect về sign-in
    if (protectedRoutes(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    // Nếu là public route, cho phép truy cập
    return NextResponse.next();
  }

  // Nếu user đã đăng nhập
  if (userId) {
    // Nếu đang ở sign-in hoặc sign-up, redirect về dashboard hoặc home
    if (pathname === '/sign-in' || pathname === '/sign-up') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Cho phép truy cập các route khác
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Luôn chạy middleware cho API routes
    '/(api|trpc)(.*)',
  ],
};
