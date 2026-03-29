import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - uploads (uploaded static media)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|uploads|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Allowed domains for the main SaaS landing page and admin
  // In production, change this to your actual app domain (e.g. saas-app.com)
  const appDomain = 'localhost:3000';

  let currentHost = hostname.replace(`.${appDomain}`, '');
  currentHost = currentHost.replace(`:${process.env.PORT || 3000}`, '');

  if (hostname === appDomain || currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // If it's the main domain, we route it normally to /app or leave it as is.
    // We will leave the root path '/' for the main landing marketing page.
    return NextResponse.next();
  }

  // If it's a subdomain (e.g. namacafe.localhost:3000)
  // Rewrite everything to `/[tenant]/path`
  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}${url.search}`, req.url));
}
