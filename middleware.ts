import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifySession } from '@/lib/session';

// Pages that only staff should see.
const PROTECTED_PAGES = ['/admin', '/crm', '/analytics', '/site-visits', '/whatsapp', '/negotiation', '/deal-room'];

// API routes that are admin-only for every method.
const ADMIN_APIS = ['/api/admin', '/api/calls', '/api/negotiations', '/api/analytics', '/api/ai/negotiate'];

// API routes where only POST is public (lead capture / visit booking from the website).
const POST_PUBLIC_APIS = ['/api/leads', '/api/site-visit'];

const under = (path: string, base: string) => path === base || path.startsWith(base + '/');

function needsAuth(path: string, method: string) {
  if (path === '/admin/login' || path === '/api/admin/login') return false;
  if (PROTECTED_PAGES.some((p) => under(path, p))) return true;
  if (ADMIN_APIS.some((p) => under(path, p))) return true;
  if (POST_PUBLIC_APIS.some((p) => under(path, p))) return method !== 'POST';
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!needsAuth(pathname, req.method)) return NextResponse.next();

  const session = await verifySession(req.cookies.get(COOKIE_NAME)?.value);
  if (session) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/crm/:path*',
    '/analytics/:path*',
    '/site-visits/:path*',
    '/whatsapp/:path*',
    '/negotiation/:path*',
    '/deal-room/:path*',
    '/api/:path*',
  ],
};
