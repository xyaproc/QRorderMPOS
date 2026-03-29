import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - uploads (uploaded files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|uploads|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Determine if we are on a "main" domain or a tenant subdomain
  // In Vercel, the main domain is usually something.vercel.app
  const isVercel = hostname.includes('.vercel.app');
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  // If it's a direct path access on a main domain (e.g. apps.vercel.app/cafedemo/menu)
  // we let Next.js handle it via the [tenant] dynamic route naturally.
  if (isVercel || isLocalhost) {
    return NextResponse.next();
  }

  // If we ever support custom domains (e.g. namacafe.com)
  // we would handle the rewrite here.
  const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';
  const currentHost = hostname.replace(`.${rootDomain}`, '');

  if (currentHost !== hostname) {
    return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}${url.search}`, req.url));
  }

  return NextResponse.next();
}
