import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|uploads|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Main app domains - semua ini dianggap sebagai domain utama (bukan subdomain tenant)
  const mainDomains = [
    'localhost',
    'localhost:3000',
    'qr-order-mpos.vercel.app',
    'qr-order-mpos-git-main-yudhisapple-8276s-projects.vercel.app',
  ];

  // Cek apakah ini adalah domain utama (bukan subdomain tenant)
  const isMainDomain = mainDomains.some(domain => hostname === domain || hostname.endsWith('.vercel.app'));

  if (isMainDomain) {
    // Ini adalah domain utama, route normal
    return NextResponse.next();
  }

  // Jika ini adalah subdomain khusus tenant (namacafe.yourdomain.com)
  // Ambil bagian subdomain saja
  const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';
  const currentHost = hostname.replace(`.${rootDomain}`, '');

  // Rewrite ke halaman tenant
  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}${url.search}`, req.url));
}

