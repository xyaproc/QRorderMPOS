import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    // Hanya jalankan middleware di halaman utama (bukan di api, static, dll)
    '/((?!api|_next/static|_next/image|uploads|favicon.ico|login|dashboard|admin).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const pathname = url.pathname;

  // Jangan proses path sistem
  const systemPaths = ['/login', '/dashboard', '/admin', '/api'];
  if (systemPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Semua domain vercel.app dianggap domain utama
  // Semua akses localhost juga dianggap domain utama
  const isMainDomain =
    hostname.includes('vercel.app') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1');

  if (isMainDomain) {
    // Ini sudah benar - Next.js akan handle routing via [tenant] folder
    return NextResponse.next();
  }

  // Jika pakai custom domain dengan subdomain (namacafe.yourdomain.com)
  const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';
  const currentHost = hostname.replace(`.${rootDomain}`, '');

  // Rewrite ke halaman tenant
  return NextResponse.rewrite(
    new URL(`/${currentHost}${pathname}${url.search}`, req.url)
  );
}
