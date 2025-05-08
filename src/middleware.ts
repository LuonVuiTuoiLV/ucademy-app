import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!.*..*|_next).*)', // Bỏ String.raw ở đây
    '/',
    '/(api|trpc)(.*)',
  ],
};
