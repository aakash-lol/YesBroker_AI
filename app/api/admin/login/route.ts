import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { COOKIE_NAME, SESSION_MAX_AGE, signSession } from '@/lib/session';

// Naive per-process throttle: 8 attempts / 10 min / IP. Fine for 1-3 admins.
const attempts = new Map<string, { n: number; reset: number }>();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10); // equalises timing for unknown emails

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && a.reset > now && a.n >= 8) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? '').toLowerCase().trim();
  const password = String(body?.password ?? '');

  const admin = email
    ? await queryOne<{ id: string; email: string; password_hash: string }>(
        'SELECT id, email, password_hash FROM admin_users WHERE email = ?',
        [email]
      )
    : null;
  const ok = await bcrypt.compare(password, admin?.password_hash ?? DUMMY_HASH);

  if (!admin || !ok) {
    attempts.set(ip, { n: (a && a.reset > now ? a.n : 0) + 1, reset: a && a.reset > now ? a.reset : now + 10 * 60_000 });
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }

  attempts.delete(ip);
  const token = await signSession({ id: admin.id, email: admin.email });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
